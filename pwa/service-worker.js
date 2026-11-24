// The production build replaces these declarations after the dist assets exist.
const CACHE_VERSION = "SOURCE_ONLY";
const STATIC_ASSETS = [];

if (CACHE_VERSION !== "SOURCE_ONLY") {
  const PROTOCOL = "vista-offline-v1";
  const STORAGE_LOCK = "vista-offline-storage";
  const STATE_DB = "vista-offline";
  const STATE_STORE = "settings";
  const STATE_KEY = "activation";
  const PREPARE_TIMEOUT = 20000;
  const SCOPE = self.registration.scope;
  const INDEX_PATH = new URL("index.html", SCOPE).pathname;
  const OFFLINE_URL = new URL("offline.html", SCOPE).href;
  const PRECACHE_URLS = STATIC_ASSETS.map((asset) => new URL(asset, SCOPE).href);
  const VERSION_PATTERN = /^[a-f0-9]{12}$/;
  const isVistaCache = (name) =>
    /^vista-(?:static|html)-[a-f0-9]{12}$/.test(name) ||
    /^th-(?:static|html)-(?:v1\.2\.1|[a-f0-9]{12})$/.test(name);
  const staticCache = (version) => "vista-static-" + version;
  const htmlCache = (version) => "vista-html-" + version;
  const supportsOffline = Boolean(self.navigator.locks && self.indexedDB && self.caches);

  function openState(create) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(STATE_DB, 1);
      let missing = false;
      let blocked = false;
      request.onupgradeneeded = () => {
        if (create) {
          request.result.createObjectStore(STATE_STORE);
        } else {
          // The default state must not leave a database or any preference behind.
          missing = true;
          request.transaction.abort();
        }
      };
      request.onblocked = () => {
        blocked = true;
        reject(new Error("Offline state database is blocked"));
      };
      request.onerror = () => {
        if (missing) resolve(null);
        else reject(request.error);
      };
      request.onsuccess = () => {
        if (blocked) request.result.close();
        else resolve(request.result);
      };
    });
  }

  async function useStateStore(mode, create, operation) {
    const db = await openState(create);
    if (!db) return undefined;

    try {
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction(STATE_STORE, mode);
        const request = operation(transaction.objectStore(STATE_STORE));
        transaction.onabort = () => reject(transaction.error || request.error);
        transaction.oncomplete = () => resolve(request.result);
      });
    } finally {
      db.close();
    }
  }

  async function readState() {
    const state = await useStateStore("readonly", false, (store) => store.get(STATE_KEY));
    if (state === undefined) return null;
    if (
      typeof state?.token !== "string" ||
      !["preparing", "enabled", "disabling"].includes(state.phase) ||
      (state.phase === "enabled" && !VERSION_PATTERN.test(state.version))
    ) {
      throw new Error("Unrecognized offline activation state");
    }
    return state;
  }

  function writeState(state) {
    return useStateStore("readwrite", state !== null, (store) =>
      state ? store.put(state, STATE_KEY) : store.delete(STATE_KEY)
    );
  }

  async function removeOwnedCaches(keepVersion) {
    const owned = (await caches.keys()).filter((name) =>
      isVistaCache(name) && name !== staticCache(keepVersion) && name !== htmlCache(keepVersion)
    );
    await Promise.all(owned.map((name) => caches.delete(name)));
    if ((await caches.keys()).some((name) => owned.includes(name))) {
      throw new Error("Offline caches could not be removed");
    }
  }

  async function hasPrecache() {
    const name = staticCache(CACHE_VERSION);
    if (!await caches.has(name)) return false;
    const entries = await Promise.all(PRECACHE_URLS.map((url) => caches.match(url, { cacheName: name })));
    return entries.every(Boolean);
  }

  // Call under STORAGE_LOCK. Keep the previous version until the new precache is complete.
  async function preparePrecache() {
    if (await hasPrecache()) return;
    const name = staticCache(CACHE_VERSION);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PREPARE_TIMEOUT);
    try {
      const cache = await caches.open(name);
      const requests = PRECACHE_URLS.map((url) => new Request(url, { cache: "reload", signal: controller.signal }));
      await cache.addAll(requests);
    } catch (error) {
      await caches.delete(name);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async function describeState(state) {
    if (!state) return { phase: "off" };
    const complete =
      state.phase === "enabled" && state.version === CACHE_VERSION && await hasPrecache().catch(() => false);
    return { phase: state.phase, token: state.token, complete };
  }

  async function removeOffline(state) {
    if (state && state.phase !== "disabling") {
      await writeState({ phase: "disabling", token: state.token });
    }
    await removeOwnedCaches();
    if (state) await writeState(null);
    return { phase: "off" };
  }

  async function prepareOffline(state) {
    const alreadyEnabled = state?.phase === "enabled";
    const token = alreadyEnabled ? state.token : crypto.randomUUID();
    if (!alreadyEnabled) await writeState({ phase: "preparing", token });

    try {
      await preparePrecache();
      await writeState({ phase: "enabled", token, version: CACHE_VERSION });
    } catch (error) {
      if (!alreadyEnabled) await removeOffline({ phase: "preparing", token });
      throw error;
    }

    await removeOwnedCaches(CACHE_VERSION);
    await self.clients.claim();
    return { phase: "enabled", token, complete: true };
  }

  self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
      if (supportsOffline) {
        await navigator.locks.request(STORAGE_LOCK, async () => {
          let state;
          try {
            state = await readState();
          } catch (error) {
            // Replacing the automatic worker must still stop its writes.
            console.warn("[PWA] Offline state unavailable during update", error);
          }
          if (state?.phase === "enabled") await preparePrecache();
        });
      }
      await self.skipWaiting();
    })());
  });

  self.addEventListener("activate", (event) => {
    if (!supportsOffline) return;
    event.waitUntil(navigator.locks.request(STORAGE_LOCK, async () => {
      const state = await readState();
      if (!state || state.phase === "disabling") {
        // The previous worker has been replaced before its caches are touched.
        await removeOffline(state);
      } else if (state.phase === "enabled" && await hasPrecache()) {
        await writeState({ ...state, version: CACHE_VERSION });
        await removeOwnedCaches(CACHE_VERSION);
        await self.clients.claim();
      }
    }).catch((error) => console.warn("[PWA] Offline activation or cleanup incomplete", error)));
  });

  async function handleCommand({ action, token }) {
    if (action === "ping") return {};
    if (!supportsOffline) throw new Error("Offline storage or synchronization is unavailable");

    return navigator.locks.request(STORAGE_LOCK, async () => {
      const state = await readState();
      switch (action) {
        case "status":
          return describeState(state);
        case "prepare":
          if (state?.phase === "disabling") return describeState(state);
          return prepareOffline(state);
        case "disable":
          if (state && state.token !== token) return describeState(state);
          return removeOffline(state);
        case "retire":
          if (state && state.phase !== "disabling") return describeState(state);
          return { ...await removeOffline(state), changed: Boolean(state) };
      }
    });
  }

  self.addEventListener("message", (event) => {
    const source = event.source;
    const port = event.ports[0];
    const command = event.data;
    if (
      !port || source?.type !== "window" || !source.url ||
      new URL(source.url).origin !== self.location.origin ||
      command?.protocol !== PROTOCOL ||
      !["ping", "status", "prepare", "disable", "retire"].includes(command.action)
    ) return;

    event.waitUntil((async () => {
      let reply;
      try {
        reply = await handleCommand(command);
      } catch (error) {
        console.warn("[PWA] Offline operation failed", error);
        reply = { error: true };
      }
      port.postMessage({ ...reply, protocol: PROTOCOL, version: CACHE_VERSION, scope: SCOPE });

      if (command.action === "prepare" || command.action === "disable" || reply.changed) {
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of windows) {
          if (client.id !== source.id) client.postMessage({ protocol: PROTOCOL, changed: true });
        }
      }
    })());
  });

  function cacheResponse(cacheName, request, response, state) {
    if (!response.ok) return { response };
    const copy = response.clone();
    const write = navigator.locks.request(STORAGE_LOCK, async () => {
      // Check again under the same lock that serializes removal and version changes.
      const current = await readState();
      if (current?.phase === "enabled" && current.token === state.token && current.version === state.version) {
        const cache = await caches.open(cacheName);
        await cache.put(request, copy);
      }
    });
    return { response, write };
  }

  async function handleFetch(request, url) {
    const navigation = request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
    let state;
    if (supportsOffline) {
      try {
        state = await readState();
      } catch {
        // Unreadable storage defaults to online operation without optional writes.
      }
    }

    if (state?.phase !== "enabled") {
      const reload = navigation || url.pathname === "/js/script.min.js";
      return { response: await (reload ? fetch(request, { cache: "reload" }) : fetch(request)) };
    }

    const staticName = staticCache(state.version);
    const htmlName = htmlCache(state.version);
    if (!navigation) {
      try {
        const cached = await caches.match(request, { cacheName: staticName });
        if (cached) return { response: cached };
      } catch {
        // A Cache Storage error must not prevent a network request.
      }
    }

    let response;
    try {
      response = await fetch(request);
    } catch {
      if (!navigation) return { response: Response.error() };

      try {
        // Homepage links share the canonical root precache entry.
        const staticKey = url.pathname === INDEX_PATH ? SCOPE : request;
        const cached =
          (await caches.match(request, { cacheName: htmlName, ignoreSearch: true })) ||
          (await caches.match(staticKey, { cacheName: staticName, ignoreSearch: true })) ||
          (await caches.match(OFFLINE_URL, { cacheName: staticName }));
        if (cached) return { response: cached };
      } catch {
        // Fall back to a plain response if Cache Storage is unavailable.
      }
      return { response: new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }) };
    }

    return cacheResponse(navigation ? htmlName : staticName, request, response, state);
  }

  self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== "GET" || url.origin !== self.location.origin) return;

    const result = handleFetch(request, url);
    event.respondWith(result.then(({ response }) => response));
    event.waitUntil(result.then(
      ({ write }) => write?.catch((error) => console.warn("[PWA] Cache write failed", error)),
      () => undefined
    ));
  });
}

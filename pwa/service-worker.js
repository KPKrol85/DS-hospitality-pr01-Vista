// The production build replaces these declarations after the dist assets exist.
const CACHE_VERSION = "SOURCE_ONLY";
const STATIC_ASSETS = [];

if (CACHE_VERSION !== "SOURCE_ONLY") {
  const STATIC_CACHE = `vista-static-${CACHE_VERSION}`;
  const HTML_CACHE = `vista-html-${CACHE_VERSION}`;
  const OFFLINE_URL = new URL("offline.html", self.registration.scope).href;
  const isVistaCache = (name) =>
    /^vista-(?:static|html)-[a-f0-9]{12}$/.test(name) ||
    /^th-(?:static|html)-(?:v1\.2\.1|[a-f0-9]{12})$/.test(name);

  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.addAll(STATIC_ASSETS.map((asset) => new URL(asset, self.registration.scope).href))
      )
    );
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(
          keys
            .filter((name) => isVistaCache(name) && name !== STATIC_CACHE && name !== HTML_CACHE)
            .map((name) => caches.delete(name))
        ))
        .then(() => self.clients.claim())
    );
  });

  self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
      return;
    }

    const cacheResponse = (cacheName, response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(
          caches.open(cacheName)
            .then((cache) => cache.put(request, copy))
            .catch((error) => console.warn("[PWA] Cache write failed", error))
        );
      }
      return response;
    };

    if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
      event.respondWith((async () => {
        try {
          return cacheResponse(HTML_CACHE, await fetch(request));
        } catch {
          try {
            const htmlCache = await caches.open(HTML_CACHE);
            const staticCache = await caches.open(STATIC_CACHE);
            const cached = (await htmlCache.match(request, { ignoreSearch: true })) ||
              (await staticCache.match(request, { ignoreSearch: true }));
            if (cached) return cached;

            // The manifest opens "/", while the precached document is "/index.html".
            if (new URL(request.url).pathname === new URL(self.registration.scope).pathname) {
              const home = await staticCache.match(new URL("index.html", self.registration.scope).href);
              if (home) return home;
            }

            return (await staticCache.match(OFFLINE_URL)) ||
              new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
          } catch {
            return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
          }
        }
      })());
      return;
    }

    event.respondWith((async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
      } catch {
        // A Cache Storage error must not prevent a network request.
      }

      try {
        return cacheResponse(STATIC_CACHE, await fetch(request));
      } catch {
        return Response.error();
      }
    })());
  });
}

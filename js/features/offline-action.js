import * as logger from "./logger.js";

const PROTOCOL = "vista-offline-v1";
const PAGE_LOCK = "vista-offline-page";
const STORAGE_LOCK = "vista-offline-storage";
const WORKER_TIMEOUT = 12000;
const COMMAND_TIMEOUT = 30000;
const WORKER_URL = new URL("/pwa/service-worker.js", location.origin).href;
const ROOT_SCOPE = new URL("/", location.origin).href;

const views = {
  checking: ["Włącz tryb offline", "Sprawdzanie trybu offline…"],
  off: ["Włącz tryb offline", "Tryb offline jest wyłączony.", "prepare"],
  preparing: ["Włącz tryb offline", "Pobieranie zasobów do trybu offline…"],
  ready: ["Wyłącz tryb offline", "Tryb offline jest gotowy.", "disable"],
  disabling: ["Wyłącz tryb offline", "Usuwanie zapisanych zasobów offline…"],
  prepareFailed: ["Włącz tryb offline", "Nie udało się przygotować trybu offline. Spróbuj ponownie.", "prepare"],
  incomplete: ["Wyłącz tryb offline", "Nie udało się potwierdzić gotowości trybu offline. Wyłącz tryb offline i włącz go ponownie.", "disable"],
  disableFailed: ["Wyłącz tryb offline", "Nie udało się zakończyć wyłączania trybu offline. Spróbuj ponownie.", "disable"],
  cleanupFailed: ["Ponów usuwanie danych offline", "Nie udało się usunąć danych trybu offline. Możesz spróbować ponownie.", "refresh"],
  checkFailed: ["Sprawdź tryb offline ponownie", "Nie udało się sprawdzić trybu offline. Możesz nadal korzystać z serwisu online.", "refresh"],
  unavailable: ["Włącz tryb offline", "Tryb offline jest niedostępny w tej przeglądarce."],
};

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const hasVistaController = (serviceWorkers) => serviceWorkers.controller?.scriptURL === WORKER_URL;

function isVistaRegistration(registration) {
  if (registration?.scope !== ROOT_SCOPE) return false;
  const workers = [registration.active, registration.waiting, registration.installing].filter(Boolean);
  return workers.length > 0 && workers.every((worker) => worker.scriptURL === WORKER_URL);
}

function askWorker(worker, action, token, timeout = COMMAND_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => finish(reject, new Error("Offline worker response timed out")), timeout);

    function finish(settle, value) {
      clearTimeout(timer);
      channel.port1.close();
      channel.port2.close();
      settle(value);
    }

    channel.port1.onmessage = ({ data }) => {
      if (data?.protocol !== PROTOCOL || data.scope !== ROOT_SCOPE || !/^[a-f0-9]{12}$/.test(data.version)) {
        finish(reject, new Error("Unexpected offline worker response"));
      } else if (data.error) {
        finish(reject, new Error("Offline worker could not complete the operation"));
      } else {
        finish(resolve, data);
      }
    };
    try {
      worker.postMessage({ protocol: PROTOCOL, action, token }, [channel.port2]);
    } catch (error) {
      finish(reject, error);
    }
  });
}

async function probeWorker(worker) {
  if (worker?.state !== "activated" || worker.scriptURL !== WORKER_URL) return null;
  try {
    await askWorker(worker, "ping", undefined, 1000);
    return worker;
  } catch {
    return null;
  }
}

async function removeOrphanCaches(serviceWorkers) {
  await navigator.locks.request(STORAGE_LOCK, async () => {
    if (await serviceWorkers.getRegistration(ROOT_SCOPE)) return;
    // This also covers a prior source-mode unregister after old tabs have gone away.
    const names = (await caches.keys()).filter((name) =>
      /^vista-(?:static|html)-[a-f0-9]{12}$/.test(name) ||
      /^th-(?:static|html)-(?:v1\.2\.1|[a-f0-9]{12})$/.test(name)
    );
    if (!names.length) return;
    if (hasVistaController(serviceWorkers)) {
      throw new Error("A retired Vista worker still controls this page");
    }
    await Promise.all(names.map((name) => caches.delete(name)));
    if ((await caches.keys()).some((name) => names.includes(name))) {
      throw new Error("Offline caches could not be removed");
    }
  });
}

async function unregisterCleanWorker(registration, worker, serviceWorkers) {
  if (registration.active !== worker || registration.installing || registration.waiting) {
    throw new Error("A worker update is still in progress");
  }
  const removed = await registration.unregister();
  if (!removed && await serviceWorkers.getRegistration(ROOT_SCOPE)) {
    throw new Error("Offline worker could not be unregistered");
  }
}

async function cleanDevelopment(serviceWorkers) {
  const registration = await serviceWorkers.getRegistration(ROOT_SCOPE);
  if (!registration) {
    await removeOrphanCaches(serviceWorkers);
  } else if (isVistaRegistration(registration)) {
    const worker = await probeWorker(registration.active);
    if (!worker) {
      // The development server does not serve the worker URL. Old controlled
      // documents can keep writing until they navigate, so defer cache cleanup.
      await registration.unregister();
      await removeOrphanCaches(serviceWorkers);
      return;
    }
    const state = await askWorker(worker, "status");
    const result = await askWorker(worker, "disable", state.token);
    if (result.phase === "off") await unregisterCleanWorker(registration, worker, serviceWorkers);
  }
}

export function initOfflineAction() {
  const serviceWorkers = navigator.serviceWorker;
  const supported = serviceWorkers && navigator.locks && window.indexedDB && window.caches;
  const production = document.documentElement.dataset.vistaBuild === "production";

  if (!production) {
    if (supported) {
      void navigator.locks.request(PAGE_LOCK, () => cleanDevelopment(serviceWorkers))
        .catch((error) => logger.warn("[PWA] Nie udało się zakończyć sprzątania w trybie deweloperskim", error));
    }
    return;
  }

  const footerBottom = document.querySelector(".site-footer .footer__bottom");
  if (!footerBottom) return;

  const control = document.createElement("div");
  control.className = "offline-action";
  const explanation = document.createElement("p");
  explanation.id = "vista-offline-explanation";
  explanation.textContent = "Po włączeniu trybu offline Vista pobierze i zapisze strony oraz wybrane zasoby w tej przeglądarce, aby można było z nich korzystać bez Internetu.";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn--ghost";
  button.setAttribute("aria-describedby", explanation.id);
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  control.append(explanation, button, status);
  footerBottom.append(control);

  let selection;
  let refreshing = false;
  let refreshAgain = false;
  let interacting = false;
  let lastUpdate = -Infinity;

  function render(view, token) {
    const [label, message, action] = views[view];
    selection = { action, token };
    button.textContent = label;
    button.setAttribute("aria-disabled", String(!action));
    if (status.textContent !== message) status.textContent = message;
  }

  render(supported ? "checking" : "unavailable");
  if (!supported) return;

  async function findWorker(registration) {
    const deadline = Date.now() + WORKER_TIMEOUT;
    let probed;
    do {
      const active = registration.active;
      if (active?.state === "activated" && active !== probed) {
        probed = active;
        const worker = await probeWorker(active);
        if (worker) return worker;
      }

      if (
        active?.state === "activated" && !registration.installing &&
        navigator.onLine && Date.now() - lastUpdate >= WORKER_TIMEOUT
      ) {
        lastUpdate = Date.now();
        void registration.update().catch((error) => logger.warn("[PWA] Aktualizacja Service Workera nie powiodła się", error));
      }

      if (!navigator.onLine && !registration.installing && !registration.waiting) break;
      await pause(150);
    } while (Date.now() < deadline);

    throw new Error("Guarded Vista worker is not active");
  }

  async function displayEnabled(state, worker) {
    if (state.complete) {
      const deadline = Date.now() + 3000;
      while (serviceWorkers.controller !== worker && worker.state === "activated" && Date.now() < deadline) {
        await pause(100);
      }
      if (serviceWorkers.controller === worker && worker.state === "activated") {
        render("ready", state.token);
        return;
      }
    }
    render("incomplete", state.token);
  }

  async function finishCleanup(registration, worker, state) {
    try {
      const action = state.phase === "preparing" ? "disable" : "retire";
      const result = await askWorker(worker, action, state.token);
      if (result.phase === "off") {
        await unregisterCleanWorker(registration, worker, serviceWorkers);
        render(state.phase === "preparing" ? "prepareFailed" : "off");
      } else if (result.phase === "enabled") {
        await displayEnabled(result, worker);
      } else {
        render("cleanupFailed");
      }
    } catch (error) {
      logger.warn("[PWA] Sprzątanie trybu offline nie zakończyło się", error);
      render("cleanupFailed");
    }
  }

  async function readCurrentState() {
    const registration = await serviceWorkers.getRegistration(ROOT_SCOPE);
    if (!registration) {
      await removeOrphanCaches(serviceWorkers);
      render("off");
      return;
    }
    if (!isVistaRegistration(registration)) {
      render("unavailable");
      return;
    }

    const worker = await findWorker(registration);
    const state = await askWorker(worker, "status");
    if (state.phase === "enabled") {
      await displayEnabled(state, worker);
    } else {
      render("disabling");
      await finishCleanup(registration, worker, state);
    }
  }

  async function refresh() {
    if (interacting) return;
    if (refreshing) {
      refreshAgain = true;
      return;
    }

    refreshing = true;
    try {
      await navigator.locks.request(PAGE_LOCK, readCurrentState);
    } catch (error) {
      logger.warn("[PWA] Nie udało się sprawdzić trybu offline", error);
      render("checkFailed");
    } finally {
      refreshing = false;
      if (refreshAgain) {
        refreshAgain = false;
        void refresh();
      }
    }
  }

  async function changeState({ action, token }) {
    let registration = await serviceWorkers.getRegistration(ROOT_SCOPE);
    if (registration && !isVistaRegistration(registration)) throw new Error("Offline scope is unavailable");
    if (!registration && action === "prepare") {
      registration = await serviceWorkers.register(WORKER_URL, { scope: "/" });
    }
    if (!registration) {
      await removeOrphanCaches(serviceWorkers);
      render("off");
      return;
    }

    const worker = await findWorker(registration);
    const state = await askWorker(worker, action, token);
    if (state.phase === "enabled") {
      await displayEnabled(state, worker);
    } else if (state.phase === "off") {
      await unregisterCleanWorker(registration, worker, serviceWorkers);
      render("off");
    } else {
      await finishCleanup(registration, worker, state);
    }
  }

  button.addEventListener("click", async (event) => {
    if (!event.isTrusted || !selection.action || interacting || refreshing) return;
    const operation = selection;
    if (operation.action === "refresh") {
      render("checking");
      await refresh();
      return;
    }

    interacting = true;
    const preparing = operation.action === "prepare";
    render(preparing ? "preparing" : "disabling");
    try {
      await navigator.locks.request(PAGE_LOCK, () => changeState(operation));
    } catch (error) {
      logger.warn("[PWA] Nie udało się zmienić trybu offline", error);
      render(preparing ? "prepareFailed" : "disableFailed", operation.token);
    } finally {
      interacting = false;
    }
  });

  serviceWorkers.addEventListener("controllerchange", () => {
    if (!interacting) void refresh();
  });
  serviceWorkers.addEventListener("message", (event) => {
    if (event.source?.scriptURL === WORKER_URL && event.data?.protocol === PROTOCOL && event.data.changed) {
      void refresh();
    }
  });
  window.addEventListener("online", refresh);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) void refresh();
  });
  void refresh();
}

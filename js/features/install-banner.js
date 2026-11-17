import * as logger from "./logger.js";

const DISMISS_KEY = "install-banner-dismissed-at";
const DISMISS_PERIOD_MS = 14 * 24 * 60 * 60 * 1000;
// Session state keeps the delay cumulative across pages and presents the banner at most once per tab session.
const ELAPSED_KEY = "install-banner-visible-ms";
const SHOWN_KEY = "install-banner-shown";
const SHOW_DELAY_MS = 10000;
const OVERLAY_RETRY_MS = 2000;
const OVERLAY_SELECTOR = 'body.is-nav-open, [aria-modal="true"]:not([hidden])';

const MARKUP = `
  <aside class="install-banner" aria-labelledby="install-banner-title" hidden>
    <img class="install-banner__icon" src="/assets/img/ui/favicon-96x96.png" alt="" width="48" height="48" decoding="async" />
    <div class="install-banner__body">
      <p class="install-banner__title" id="install-banner-title">Vista Hotels &amp; Travel</p>
      <p class="install-banner__text">Zainstaluj aplikację, aby szybciej wracać do pokoi, ofert i galerii.</p>
    </div>
    <div class="install-banner__actions">
      <button type="button" class="btn btn--ghost install-banner__btn" data-install-dismiss>Nie teraz</button>
      <button type="button" class="btn btn--primary install-banner__btn" data-install-accept>Zainstaluj</button>
    </div>
  </aside>
`;

let initialized = false;

function readStorage(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
  }
}

function getStorage(name) {
  try {
    return window[name] || null;
  } catch {
    return null;
  }
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export function initInstallBanner() {
  if (initialized) return;
  initialized = true;

  // Installation is offered only where Vista's production service worker is registered.
  if (document.documentElement.dataset.vistaBuild !== "production") return;
  if (!("onbeforeinstallprompt" in window) || isStandalone()) return;

  const local = getStorage("localStorage");
  const session = getStorage("sessionStorage");

  const dismissedAt = Number(readStorage(local, DISMISS_KEY));
  const recentlyDismissed = dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_PERIOD_MS;
  const shownThisSession = readStorage(session, SHOWN_KEY) === "1";

  // Keep the browser's own mini-infobar from re-prompting after a decline or an earlier presentation.
  if (recentlyDismissed || shownThisSession) {
    window.addEventListener("beforeinstallprompt", (event) => event.preventDefault());
    return;
  }

  let deferredPrompt = null;
  let banner = null;
  let timer = 0;
  let elapsed = Number(readStorage(session, ELAPSED_KEY)) || 0;
  let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
  let done = false;
  let shown = false;

  function settleElapsed() {
    if (visibleSince === null) return;
    const now = performance.now();
    elapsed += now - visibleSince;
    visibleSince = now;
    writeStorage(session, ELAPSED_KEY, String(Math.round(elapsed)));
  }

  function clearTimer() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function schedule() {
    clearTimer();
    if (done || shown || !deferredPrompt || visibleSince === null) return;
    settleElapsed();
    timer = window.setTimeout(present, Math.max(0, SHOW_DELAY_MS - elapsed));
  }

  function teardown() {
    done = true;
    clearTimer();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", settleElapsed);
  }

  function hide() {
    if (!banner) return;
    if (banner.contains(document.activeElement)) document.activeElement.blur();
    banner.hidden = true;
  }

  function dismiss() {
    writeStorage(local, DISMISS_KEY, String(Date.now()));
    hide();
    teardown();
  }

  async function install() {
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    hide();
    if (!promptEvent) return;

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      logger.info("[PWA] Wynik instalacji", outcome);
      if (outcome === "dismissed") writeStorage(local, DISMISS_KEY, String(Date.now()));
    } catch (error) {
      logger.warn("[PWA] Nie udało się otworzyć instalatora", error);
    }
    // A deferred prompt can be used only once; installation itself is confirmed by `appinstalled`.
    teardown();
  }

  function render() {
    document.body.insertAdjacentHTML("beforeend", MARKUP);
    banner = document.body.lastElementChild;
    banner.querySelector("[data-install-dismiss]").addEventListener("click", dismiss);
    banner.querySelector("[data-install-accept]").addEventListener("click", install);
  }

  function present() {
    timer = 0;
    if (done || shown || !deferredPrompt || document.visibilityState !== "visible") return;

    // Wait for an open menu or dialog to close instead of competing with it.
    if (document.querySelector(OVERLAY_SELECTOR)) {
      timer = window.setTimeout(present, OVERLAY_RETRY_MS);
      return;
    }

    if (!banner) render();
    banner.hidden = false;
    shown = true;
    writeStorage(session, SHOWN_KEY, "1");
    // Counting stops once shown; the banner stays available until the user acts or leaves the page.
    window.removeEventListener("pagehide", settleElapsed);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }

  function onBeforeInstallPrompt(event) {
    // Suppress the browser's own mini-infobar; the stored event is replayed only from the install button.
    event.preventDefault();
    if (done) return;
    deferredPrompt = event;
    schedule();
  }

  function onVisibilityChange() {
    if (document.visibilityState === "visible") {
      visibleSince = performance.now();
      schedule();
      return;
    }

    settleElapsed();
    visibleSince = null;
    clearTimer();
  }

  function onAppInstalled() {
    deferredPrompt = null;
    hide();
    teardown();
    window.removeEventListener("appinstalled", onAppInstalled);
  }

  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.addEventListener("appinstalled", onAppInstalled);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", settleElapsed);
}

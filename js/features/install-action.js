import * as logger from "./logger.js";

export function initInstallAction() {
  if (document.documentElement.dataset.vistaBuild !== "production") return;
  if (!("onbeforeinstallprompt" in window)) return;
  if (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true) return;

  const footerBottom = document.querySelector(".site-footer .footer__bottom");
  if (!footerBottom) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn--ghost install-action";
  button.textContent = "Zainstaluj aplikację";

  let deferredPrompt = null;
  let prompting = false;

  function syncButton() {
    if (deferredPrompt && !prompting) {
      if (!button.isConnected) footerBottom.append(button);
      return;
    }

    if (document.activeElement === button) {
      footerBottom.closest(".site-footer").querySelector(".footer__social-links a:last-child")?.focus();
    }
    button.remove();
  }

  function onBeforeInstallPrompt(event) {
    if (!event.cancelable || typeof event.prompt !== "function") return;

    event.preventDefault();
    deferredPrompt = event;
    syncButton();
  }

  button.addEventListener("click", async (event) => {
    if (!event.isTrusted || !deferredPrompt || prompting) return;

    // The event is single-use. A subsequent attempt needs a fresh event from the browser.
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    prompting = true;

    try {
      const promptResult = promptEvent.prompt();
      syncButton();
      await promptResult;
      const { outcome } = await promptEvent.userChoice;
      logger.info("[PWA] Wybór w oknie instalacji", outcome);
    } catch (error) {
      logger.warn("[PWA] Nie udało się otworzyć instalatora", error);
    } finally {
      prompting = false;
      syncButton();
    }
  });

  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.addEventListener("appinstalled", () => {
    window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    deferredPrompt = null;
    syncButton();
  }, { once: true });
}

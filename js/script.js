document.documentElement.classList.replace('no-js', 'js');

import { initNav } from "./features/nav.js";
import { initTheme } from "./features/theme.js";
import { initReveal } from "./features/reveal.js";
import { initLightbox } from "./features/lightbox.js";
import { initForm } from "./features/form.js";
import { initTabs } from "./features/tabs.js";
import { initRoomFilters } from "./features/room-filters.js";
import { initCompactHeader } from "./features/compact-header.js";
import { initGalleryFilters } from "./features/gallery-filters.js";
import { setAriaCurrent } from "./features/aria-current.js";
import { initJsonLd } from "./features/seo-jsonld.js";
import { initMapEmbed } from "./features/map-embed.js";
import { initProjectBanner } from "./features/project-banner.js";
import * as logger from "./features/logger.js";

function setYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = new Date().getFullYear();
}

async function configureSW() {
  if (!("serviceWorker" in navigator)) return;

  const workerUrl = new URL("/pwa/service-worker.js", location.origin).href;
  const rootScope = new URL("/", location.origin).href;

  try {
    if (document.documentElement.dataset.vistaBuild === "production") {
      const registration = await navigator.serviceWorker.register(workerUrl, { scope: "/" });
      logger.info("[PWA] Service Worker zarejestrowany", registration.scope);
      return;
    }

    // A prior production visit may leave Vista's worker controlling source pages.
    const registration = await navigator.serviceWorker.getRegistration(rootScope);
    if (!registration || registration.scope !== rootScope) return;

    const workers = [registration.active, registration.waiting, registration.installing].filter(Boolean);
    if (!workers.length || workers.some((worker) => worker.scriptURL !== workerUrl)) return;

    const controlledByVista = navigator.serviceWorker.controller?.scriptURL === workerUrl;
    await registration.unregister();

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) =>
            /^vista-(?:static|html)-[a-f0-9]{12}$/.test(name) ||
            /^th-(?:static|html)-(?:v1\.2\.1|[a-f0-9]{12})$/.test(name)
          )
          .map((name) => caches.delete(name))
      );
    }

    if (controlledByVista) location.reload();
  } catch (error) {
    logger.error("[PWA] Błąd konfiguracji Service Workera", error);
  }
}

function boot() {
  setYear();
  setAriaCurrent();
  initTheme();
  initNav();
  initCompactHeader();
  initReveal();
  initLightbox();
  initForm();
  initTabs();
  initRoomFilters();
  initJsonLd();
  initMapEmbed();
  initProjectBanner();

  if (document.getElementById("gallery-filters")) {
    initGalleryFilters();
  }

  void configureSW();
}

window.addEventListener("DOMContentLoaded", boot);

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

function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("pwa/service-worker.js", { scope: "/" })
      .then((reg) => {
        logger.info("[PWA] Service Worker zarejestrowany", reg.scope);
      })
      .catch((err) => {
        logger.error("[PWA] Błąd rejestracji Service Workera", err);
      });
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

  registerSW();
}

window.addEventListener("DOMContentLoaded", boot);

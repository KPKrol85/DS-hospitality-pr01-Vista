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
import { initInstallAction } from "./features/install-action.js";
import { initOfflineAction } from "./features/offline-action.js";

function setYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = new Date().getFullYear();
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

  if (document.getElementById("gallery-filters")) {
    initGalleryFilters();
  }

  initOfflineAction();
}

// The deferred bundle runs after parsing. Listen before DOMContentLoaded to capture early install prompts.
initInstallAction();

window.addEventListener("DOMContentLoaded", boot);

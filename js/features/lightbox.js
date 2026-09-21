import { activateModal, isActiveModal, restoreModalFocus, trapModalFocus } from "./modal-focus.js";

export function initLightbox() {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;

  const img = lightbox.querySelector(".lightbox__img");
  const caption = lightbox.querySelector(".lightbox__caption");
  const closeBtns = lightbox.querySelectorAll("[data-lightbox-close]");
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");
  const dialogEl = lightbox.querySelector(".lightbox__dialog");

  const isVisible = (el) => !!(el.offsetParent || el.getClientRects().length);

  const items = () => {
    const activeCat = document.body.dataset.galleryFilter || "all";
    const all = Array.from(document.querySelectorAll(".gallery-grid [data-lightbox-item]"));
    return all.filter((a) => {
      const cat = a.getAttribute("data-cat-item");
      const matchCat = activeCat === "all" || cat === activeCat;
      return matchCat && isVisible(a);
    });
  };

  let index = 0;
  let lastFocused = null;
  let lastTapTime = 0;
  let releaseModal = null;
  let previousBodyOverflow = "";

  function renderFromAnchor(a) {
    const fullSrc = a.getAttribute("href");
    const thumbImg = a.querySelector("img");
    const text = a.getAttribute("data-caption") || thumbImg?.alt || "";

    if (img && fullSrc) {
      img.src = fullSrc;
      img.alt = text || "Podgląd";

      if (thumbImg) {
        const width = thumbImg.getAttribute("width");
        const height = thumbImg.getAttribute("height");

        if (width) {
          img.setAttribute("width", width);
        } else {
          img.removeAttribute("width");
        }

        if (height) {
          img.setAttribute("height", height);
        } else {
          img.removeAttribute("height");
        }
      }
    }

    if (caption) caption.textContent = text;
  }

  function setFullscreen(on) {
    if (on) {
      lightbox.classList.add("lightbox--fullscreen");
    } else {
      lightbox.classList.remove("lightbox--fullscreen");
    }
  }

  function toggleFullscreen() {
    const isOn = lightbox.classList.contains("lightbox--fullscreen");
    setFullscreen(!isOn);
  }

  function open(i, focusOrigin) {
    if (!lightbox.hidden) return;

    const list = items();
    if (!list.length) return;
    index = ((i % list.length) + list.length) % list.length;

    renderFromAnchor(list[index]);
    lastFocused = focusOrigin || document.activeElement;

    setFullscreen(false);
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    releaseModal = activateModal(lightbox, dialogEl || prevBtn || nextBtn || closeBtns[0]);
    (dialogEl || prevBtn || nextBtn || closeBtns[0])?.focus({ preventScroll: true });
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (lightbox.hidden) return;

    setFullscreen(false);
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
    releaseModal?.();
    releaseModal = null;
    restoreModalFocus(lastFocused);
    lastFocused = null;
  }

  function show(delta) {
    const list = items();
    if (!list.length) return;
    index = (index + delta + list.length) % list.length;
    renderFromAnchor(list[index]);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-lightbox-item]");
    if (!a) return;
    if (!a.closest(".gallery-grid")) return;

    e.preventDefault();
    const list = items();
    const i = list.indexOf(a);
    if (i === -1) return;
    open(i, a);
  });

  const observer = new MutationObserver(() => {
    const list = items();
    if (lightbox.hidden) return;
    if (!list.length) return close();
    if (index >= list.length) index = 0;
    renderFromAnchor(list[index]);
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["data-gallery-filter"] });

  closeBtns.forEach((btn) => btn.addEventListener("click", close));
  lightbox.querySelector(".lightbox__backdrop")?.addEventListener("click", close);
  prevBtn?.addEventListener("click", () => show(-1));
  nextBtn?.addEventListener("click", () => show(1));

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden || !isActiveModal(lightbox)) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      close();
      return;
    }
    if (e.key === "ArrowLeft") show(-1);
    if (e.key === "ArrowRight") show(1);
    trapModalFocus(e, lightbox, dialogEl || lightbox);
  });

  if (img) {
    img.addEventListener("dblclick", (e) => {
      if (lightbox.hidden) return;
      e.stopPropagation();
      e.preventDefault();
      toggleFullscreen();
    });
  }

  function handlePointerDown(e) {
    if (lightbox.hidden) return;
    if (e.pointerType !== "touch") return;

    const now = Date.now();
    if (now - lastTapTime < 300) {
      e.preventDefault();
      e.stopPropagation();
      toggleFullscreen();
    }
    lastTapTime = now;
  }

  if (img) {
    img.addEventListener("pointerdown", handlePointerDown);
  }
}

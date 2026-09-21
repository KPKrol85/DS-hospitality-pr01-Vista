import { activateModal, isActiveModal, restoreModalFocus, trapModalFocus } from "./modal-focus.js";

const STORAGE_KEY = "vista_project_banner_accepted";

export function initProjectBanner() {
  const modal = document.getElementById("projectBanner");
  if (!modal) return;

  const dialog = modal.querySelector(".project-modal__content");
  const acceptButton = document.getElementById("projectBannerAccept");
  if (!dialog || !acceptButton) return;

  let lastFocused = null;
  let releaseModal = null;

  const hasAccepted = (() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  })();

  if (hasAccepted) return;

  function persistAcceptance() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* localStorage may be unavailable in privacy-restricted contexts */
    }
  }

  function closeBanner() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-project-modal");
    releaseModal?.();
    releaseModal = null;
    restoreModalFocus(lastFocused);
    lastFocused = null;
  }

  function acceptBanner() {
    persistAcceptance();
    closeBanner();
  }

  lastFocused = document.activeElement;
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-project-modal");
  releaseModal = activateModal(modal, dialog);
  dialog.focus();

  acceptButton.addEventListener("click", acceptBanner);

  document.addEventListener("keydown", (event) => {
    if (modal.hidden || !isActiveModal(modal)) return;

    if (event.key === "Escape") {
      event.preventDefault();
      acceptBanner();
      return;
    }

    trapModalFocus(event, modal, dialog);
  });
}

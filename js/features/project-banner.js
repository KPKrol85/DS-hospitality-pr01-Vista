const STORAGE_KEY = "vista_project_banner_accepted";

export function initProjectBanner() {
  const modal = document.getElementById("projectBanner");
  if (!modal) return;

  const dialog = modal.querySelector(".project-modal__content");
  const acceptButton = document.getElementById("projectBannerAccept");
  if (!dialog || !acceptButton) return;

  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

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

    if (lastFocused instanceof HTMLElement) {
      lastFocused.focus();
    }
  }

  function acceptBanner() {
    persistAcceptance();
    closeBanner();
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || modal.hidden) return;

    const focusable = [...modal.querySelectorAll(focusableSelector)].filter((element) => {
      return !element.hasAttribute("disabled") && !element.hasAttribute("hidden");
    });

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  lastFocused = document.activeElement;
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-project-modal");
  dialog.focus();

  acceptButton.addEventListener("click", acceptBanner);

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      acceptBanner();
      return;
    }

    trapFocus(event);
  });
}

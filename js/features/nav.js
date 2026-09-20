export function initNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const mobileMq = window.matchMedia("(max-width: 960px)");
  let lastFocused = null;

  const CLOSED_LABEL = "Otwórz menu";
  const OPEN_LABEL = "Zamknij menu";

  function focusables() {
    return [...nav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.hasAttribute("disabled"));
  }

  function isOpen() {
    return nav.classList.contains("is-open");
  }

  function open() {
    lastFocused = document.activeElement;
    nav.hidden = false;

    nav.classList.add("is-open");
    document.body.classList.add("is-nav-open");

    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", OPEN_LABEL);

    const first = focusables()[0];
    if (first) first.focus();
  }

  function close({ returnFocus = true } = {}) {
    nav.classList.remove("is-open");
    nav.hidden = true;

    document.body.classList.remove("is-nav-open");

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", CLOSED_LABEL);

    if (returnFocus && lastFocused instanceof HTMLElement) {
      lastFocused.focus();
    }
  }

  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", CLOSED_LABEL);

  const syncVisibility = () => {
    if (mobileMq.matches) {
      nav.hidden = !isOpen();
      return;
    }

    nav.hidden = false;
  };

  syncVisibility();
  mobileMq.addEventListener("change", syncVisibility);

  toggle.addEventListener("click", () => {
    isOpen() ? close() : open();
  });

  nav.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof Element && t.matches("a")) {
      close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== "Tab") return;

    const els = focusables();
    if (!els.length) return;

    const first = els[0];
    const last = els[els.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

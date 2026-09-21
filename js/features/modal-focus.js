const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "textarea",
  "iframe",
  "object",
  "embed",
  "[contenteditable]:not([contenteditable=\"false\"])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(", ");

const modalEntries = [];
const inertSnapshots = new Map();

function isRendered(element) {
  if (!(element instanceof HTMLElement) || !element.isConnected) return false;
  if (element.closest("[hidden], [inert], [aria-hidden=\"true\"]")) return false;

  const style = getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.visibility !== "collapse" && element.getClientRects().length > 0;
}

function isEligibleControl(element) {
  return isRendered(element) && element.tabIndex >= 0 && !element.matches(":disabled") && element.getAttribute("aria-disabled") !== "true";
}

function rememberInertState(element) {
  if (!inertSnapshots.has(element)) {
    inertSnapshots.set(element, element.inert);
  }
}

function getIsolationElements(modal) {
  const activePath = [];
  const background = [];
  let current = modal;

  while (current && current !== document.body) {
    activePath.push(current);

    const parent = current.parentElement;
    if (!parent) break;

    for (const sibling of parent.children) {
      if (sibling !== current) background.push(sibling);
    }

    current = parent;
  }

  return { activePath, background };
}

function applyModalIsolation() {
  for (const [element, wasInert] of inertSnapshots) {
    element.inert = wasInert;
  }

  if (!modalEntries.length) {
    inertSnapshots.clear();
    return;
  }

  const activeEntry = modalEntries[modalEntries.length - 1];
  const { activePath, background } = getIsolationElements(activeEntry.modal);

  for (const element of [...activePath, ...background]) {
    rememberInertState(element);
  }

  for (const element of activePath) {
    element.inert = false;
  }

  for (const element of background) {
    element.inert = true;
  }
}

function safelyFocus(element) {
  try {
    element.focus({ preventScroll: true });
    return document.activeElement === element;
  } catch {
    return false;
  }
}

export function activateModal(modal, focusTarget = modal) {
  const entry = { modal, focusTarget };
  modalEntries.push(entry);
  applyModalIsolation();

  let active = true;
  return () => {
    if (!active) return;
    active = false;

    const entryIndex = modalEntries.indexOf(entry);
    if (entryIndex !== -1) modalEntries.splice(entryIndex, 1);
    applyModalIsolation();
  };
}

export function isActiveModal(modal) {
  return modalEntries.length > 0 && modalEntries[modalEntries.length - 1].modal === modal;
}

export function getFocusableControls(modal) {
  return [...modal.querySelectorAll(FOCUSABLE_SELECTOR)].filter(isEligibleControl);
}

export function trapModalFocus(event, modal, initialFocusTarget = modal) {
  if (event.key !== "Tab" || !isActiveModal(modal)) return false;

  const controls = getFocusableControls(modal);
  const current = document.activeElement;

  if (!controls.length) {
    event.preventDefault();
    if (current !== initialFocusTarget && isRendered(initialFocusTarget)) safelyFocus(initialFocusTarget);
    return true;
  }

  const first = controls[0];
  const last = controls[controls.length - 1];

  if (current === initialFocusTarget || !modal.contains(current) || !controls.includes(current)) {
    event.preventDefault();
    safelyFocus(event.shiftKey ? last : first);
    return true;
  }

  if (event.shiftKey && current === first) {
    event.preventDefault();
    safelyFocus(last);
    return true;
  }

  if (!event.shiftKey && current === last) {
    event.preventDefault();
    safelyFocus(first);
    return true;
  }

  return false;
}

export function restoreModalFocus(origin) {
  if (isEligibleControl(origin) && safelyFocus(origin)) return true;

  const activeEntry = modalEntries[modalEntries.length - 1];
  if (activeEntry && isRendered(activeEntry.focusTarget) && safelyFocus(activeEntry.focusTarget)) return true;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  return false;
}

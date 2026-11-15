// Keys are the offer card IDs in offers.html; only these values can pre-fill the message.
const OFFER_NAMES = new Map([
  ["weekend", "Weekend dla dwojga"],
  ["biz", "Biznes w mieście"],
  ["long-stay", "Zostań dłużej"],
  ["family", "Rodzinny city break"],
  ["wellness", "Relaks w rytmie slow"],
  ["premium", "Premium z widokiem"],
]);

export function initForm() {
  const form = document.querySelector("[data-form]");
  if (!form) return;

  const name = form.querySelector("#name");
  const email = form.querySelector("#email");
  const phone = form.querySelector("#phone");
  const checkin = form.querySelector("#checkin");
  const checkout = form.querySelector("#checkout");
  const guests = form.querySelector("#guests");

  const $ = (id) => document.getElementById(id);

  function setError(input, msgId, show) {
    input?.setAttribute("aria-invalid", show ? "true" : "false");
    const msg = $(msgId);
    if (msg) msg.hidden = !show;
  }

  function formatLocalISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseLocalISO(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (year === 0) return null;
    const d = new Date(0);
    d.setFullYear(year, month - 1, day);
    d.setHours(0, 0, 0, 0);
    return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day ? d : null;
  }

  function refreshCheckinMin() {
    const todayISO = formatLocalISO(new Date());
    if (checkin) checkin.min = todayISO;
    return todayISO;
  }

  refreshCheckinMin();

  function nextDay(iso) {
    const d = parseLocalISO(iso);
    if (!d) return "";
    d.setDate(d.getDate() + 1);
    return formatLocalISO(d);
  }

  function syncCheckoutMin() {
    if (!checkout) return;
    if (checkin?.value) {
      const minOut = nextDay(checkin.value) || nextDay(formatLocalISO(new Date()));
      checkout.min = minOut;
      if (checkout.value && checkout.value < minOut) checkout.value = minOut;
    } else {
      checkout.min = "";
    }
  }

  function validateName() {
    const valid = (name?.value || "").trim().length > 1;
    setError(name, "err-name", !valid);
    return valid;
  }

  function validateEmail() {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.value || "");
    setError(email, "err-email", !valid);
    return valid;
  }

  function validatePhone() {
    const value = (phone.value || "").trim();
    const rePL = /^(\+?\d{1,3})?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;
    const valid = value === "" || rePL.test(value);
    setError(phone, "err-phone", !valid);
    return valid;
  }

  // Optional fields: an empty value is omitted, but unparseable browser input (badInput) is malformed.
  function isOmitted(input) {
    return !input || (input.value.trim() === "" && !input.validity?.badInput);
  }

  function showError(input, msgId, message) {
    const el = $(msgId);
    if (el && message) el.textContent = message;
    setError(input, msgId, !!message);
    return !message;
  }

  // Stay dates are optional as a pair: both omitted, or a valid arrival (today or later) and a later departure.
  function validateCheckin() {
    const todayISO = refreshCheckinMin();
    let message = "";
    if (isOmitted(checkin)) {
      if (!isOmitted(checkout)) message = "Podaj także datę przyjazdu albo usuń datę wyjazdu.";
    } else {
      const date = parseLocalISO(checkin.value);
      if (!date) message = "Podaj poprawną datę przyjazdu.";
      else if (formatLocalISO(date) < todayISO) message = "Wybierz datę przyjazdu: dziś lub później.";
    }
    return showError(checkin, "err-checkin", message);
  }

  function validateCheckout() {
    let message = "";
    if (isOmitted(checkout)) {
      if (!isOmitted(checkin)) message = "Podaj także datę wyjazdu albo usuń datę przyjazdu.";
    } else {
      const date = parseLocalISO(checkout.value);
      const minOut = nextDay(checkin?.value);
      if (!date) message = "Podaj poprawną datę wyjazdu.";
      else if (minOut && formatLocalISO(date) < minOut) message = "Wybierz datę wyjazdu co najmniej dzień po przyjeździe.";
    }
    return showError(checkout, "err-checkout", message);
  }

  function validateGuests() {
    // Empty is allowed; otherwise check the complete value and never truncate 1.5 or 6.5 into range.
    const value = guests.value.trim();
    const n = Number(value);
    const valid = isOmitted(guests) || (value !== "" && Number.isInteger(n) && n >= 1 && n <= 6);
    setError(guests, "err-guests", !valid);
    return valid;
  }

  name?.addEventListener("input", () => {
    if (name.getAttribute("aria-invalid") === "true") validateName();
  });
  email?.addEventListener("input", () => {
    if (email.getAttribute("aria-invalid") === "true") validateEmail();
  });

  checkin?.addEventListener("change", () => {
    syncCheckoutMin();
    if (checkin.getAttribute("aria-invalid") === "true") validateCheckin();
    // Departure validity depends on arrival, and syncCheckoutMin() may adjust its value.
    if (checkout?.getAttribute("aria-invalid") === "true") validateCheckout();
  });
  checkin?.addEventListener("input", () => {
    if (checkin.getAttribute("aria-invalid") === "true") validateCheckin();
  });
  syncCheckoutMin();

  checkout?.addEventListener("change", () => {
    if (checkout.getAttribute("aria-invalid") === "true") validateCheckout();
    // A missing-arrival error depends on whether departure is still supplied.
    if (checkin?.getAttribute("aria-invalid") === "true") validateCheckin();
  });
  checkout?.addEventListener("input", () => {
    if (checkout.getAttribute("aria-invalid") === "true") validateCheckout();
    if (checkin?.getAttribute("aria-invalid") === "true") validateCheckin();
  });

  guests?.addEventListener("input", () => {
    validateGuests();
  });

  phone?.addEventListener("input", () => {
    validatePhone();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let ok = true;

    if (name) {
      const v = validateName();
      ok = ok && v;
    }

    if (email) {
      const v = validateEmail();
      ok = ok && v;
    }
    if (phone) {
      const v = validatePhone();
      ok = ok && v;
    }

    if (checkin) {
      const v = validateCheckin();
      ok = ok && v;
    }
    if (checkout) {
      const v = validateCheckout();
      ok = ok && v;
    }

    if (guests) {
      const v = validateGuests();
      ok = ok && v;
    }

    const formData = new FormData(form);
    const pot = formData.get("website");
    if ((pot || "").toString().trim() !== "") return;

    if (!ok) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    // Native submission to Netlify Forms is the only success path; its action page confirms delivery.
    // A mismatched identity would not reach the registered "booking" form, so nothing is sent or reset.
    if (form.getAttribute("name") !== "booking" || formData.get("form-name") !== "booking") return;

    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute("aria-invalid", "false"));
    form.submit();
  });

  // Fills only an empty message, once at load; the visitor owns the text afterwards.
  function prefillOfferMessage() {
    const message = form.querySelector("#message");
    if (!message || message.value !== "") return;
    const offerIds = new URLSearchParams(window.location.search).getAll("oferta");
    const offerName = offerIds.length === 1 ? OFFER_NAMES.get(offerIds[0]) : undefined;
    if (offerName) message.value = `Pytanie o projekt Vista — przykładowa oferta „${offerName}”.`;
  }

  form.noValidate = true;
  prefillOfferMessage();
}

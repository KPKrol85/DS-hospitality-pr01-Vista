export function initForm() {
  const form = document.querySelector("[data-form]");
  if (!form) return;

  const success = form.querySelector(".form__success");
  const name = form.querySelector("#name");
  const email = form.querySelector("#email");
  const phone = form.querySelector("#phone");
  const checkin = form.querySelector("#checkin");
  const checkout = form.querySelector("#checkout");
  const guests = form.querySelector("#guests");
  const consent = form.querySelector("#consent");

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

  function validateCheckin() {
    const todayISO = refreshCheckinMin();
    const value = checkin?.value || "";
    const date = parseLocalISO(value);
    const valid = !!date && formatLocalISO(date) >= todayISO;
    const message = $("err-checkin");
    if (message) {
      message.textContent = !value
        ? "Wybierz datę przyjazdu."
        : !date
          ? "Podaj poprawną datę przyjazdu."
          : "Wybierz datę przyjazdu: dziś lub później.";
    }
    setError(checkin, "err-checkin", !valid);
    return valid;
  }

  function validateCheckout() {
    const date = parseLocalISO(checkout?.value);
    const minOut = nextDay(checkin?.value);
    const valid = !!date && (!checkin?.value || (!!minOut && formatLocalISO(date) >= minOut));
    setError(checkout, "err-checkout", !valid);
    return valid;
  }

  function validateConsent() {
    const valid = consent?.checked === true;
    setError(consent, "err-consent", !valid);
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
  });
  checkout?.addEventListener("input", () => {
    if (checkout.getAttribute("aria-invalid") === "true") validateCheckout();
  });

  consent?.addEventListener("change", () => {
    if (consent.getAttribute("aria-invalid") === "true") validateConsent();
  });

  guests?.addEventListener("input", () => {
    const n = parseInt(guests.value || "0", 10);
    setError(guests, "err-guests", !(n >= 1 && n <= 6));
  });

  phone?.addEventListener("input", () => {
    const value = (phone.value || "").trim();
    const rePL = /^(\+?\d{1,3})?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;
    const isValid = value === "" || rePL.test(value);
    setError(phone, "err-phone", !isValid);
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
      const value = (phone.value || "").trim();
      const rePL = /^(\+?\d{1,3})?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;
      const v = value === "" || rePL.test(value);
      setError(phone, "err-phone", !v);
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
      const n = parseInt(guests.value || "0", 10);
      const v = n >= 1 && n <= 6;
      setError(guests, "err-guests", !v);
      ok = ok && v;
    }

    if (consent) {
      const v = validateConsent();
      ok = ok && v;
    }

    const formData = new FormData(form);
    const pot = formData.get("website");
    if ((pot || "").toString().trim() !== "") return;

    if (!ok) {
      if (success) success.hidden = true;
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    if (form.getAttribute("name") === "booking" && formData.get("form-name") === "booking") {
      form.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute("aria-invalid", "false"));
      form.submit();
      return;
    }

    if (success) success.hidden = false;
    form.reset();
    syncCheckoutMin();
    const btn = form.querySelector('button[type="submit"]');
    btn?.focus();
  });

  form.noValidate = true;
}

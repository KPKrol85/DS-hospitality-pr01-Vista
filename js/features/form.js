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
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const todayISO = formatLocalISO(today);
  const nextDayISO = formatLocalISO(tomorrow);
  if (checkin) checkin.min = todayISO;

  function nextDay(iso) {
    const d = parseLocalISO(iso);
    if (!d) return "";
    d.setDate(d.getDate() + 1);
    return formatLocalISO(d);
  }

  function syncCheckoutMin() {
    if (!checkout) return;
    if (checkin?.value) {
      const minOut = nextDay(checkin.value) || nextDayISO;
      checkout.min = minOut;
      if (checkout.value && checkout.value < minOut) checkout.value = minOut;
    } else {
      checkout.min = "";
    }
  }

  checkin?.addEventListener("change", syncCheckoutMin);
  syncCheckoutMin();

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
      const v = (name.value || "").trim().length > 1;
      setError(name, "err-name", !v);
      ok = ok && v;
    }

    if (email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const v = re.test(email.value || "");
      setError(email, "err-email", !v);
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
      const v = !!checkin.value;
      setError(checkin, "err-checkin", !v);
      ok = ok && v;
    }
    if (checkout) {
      const v = !!checkout.value && (!checkin?.value || checkout.value >= nextDay(checkin.value));
      setError(checkout, "err-checkout", !v);
      ok = ok && v;
    }

    if (guests) {
      const n = parseInt(guests.value || "0", 10);
      const v = n >= 1 && n <= 6;
      setError(guests, "err-guests", !v);
      ok = ok && v;
    }

    if (consent) {
      const v = consent.checked === true;
      setError(consent, "err-consent", !v);
      ok = ok && v;
    }

    const pot = new FormData(form).get("website");
    if ((pot || "").toString().trim() !== "") return;

    if (!ok) {
      if (success) success.hidden = true;
      return;
    }

    if (form.hasAttribute("data-netlify")) {
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
}

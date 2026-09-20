(() => {
  const KEY = "theme-pref";
  let pref = "auto";
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark" || stored === "auto") pref = stored;
  } catch {}
  const resolved = pref === "auto" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : pref;
  document.documentElement.setAttribute("data-theme", resolved);
})();

export function setAriaCurrent() {
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  document.querySelectorAll("[data-nav]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const target = (href.split("/").pop() || "index.html").toLowerCase();

    const isCurrent = target === current || (target === "index.html" && (current === "" || current === "index.html"));

    if (isCurrent) {
      a.setAttribute("aria-current", "page");
      a.classList.add("is-active");
    } else {
      a.removeAttribute("aria-current");
      a.classList.remove("is-active");
    }
  });
}

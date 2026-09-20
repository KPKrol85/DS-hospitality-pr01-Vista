
export function initCompactHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const root = document.documentElement;
  const cssH = parseInt(getComputedStyle(root).getPropertyValue("--header-h"), 10) || 68;

  const ENTER = Math.round(cssH * 0.8);
  const LEAVE = Math.round(cssH * 0.4);

  let compact = false;
  let ticking = false;

  const apply = () => {
    const y = window.scrollY;

    if (!compact && y > ENTER) {
      compact = true;
      header.classList.add("is-compact");
    }

    else if (compact && y < LEAVE) {
      compact = false;
      header.classList.remove("is-compact");
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(apply);
      ticking = true;
    }
  };

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  apply();
}

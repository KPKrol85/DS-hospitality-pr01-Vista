
export function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || els.length === 0) return;

  let io;
  try {
    io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(el => {
      io.observe(el);
      const rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.right > 0 && rect.top < viewportHeight && rect.left < viewportWidth) {
        el.classList.add('is-revealed');
      }
    });

    document.documentElement.classList.add('reveal-ready');
    window.requestAnimationFrame(() => {
      if (document.documentElement.classList.contains('reveal-ready')) {
        document.documentElement.classList.add('reveal-animated');
      }
    });
  } catch {
    io?.disconnect();
    document.documentElement.classList.remove('reveal-ready', 'reveal-animated');
  }
}

const MAP_LOAD_TIMEOUT_MS = 6000;

export function initMapEmbed() {
  const map = document.querySelector('[data-map-embed]');
  if (!map) return;

  const iframe = map.querySelector('[data-map-iframe]');
  const fallback = map.querySelector('[data-map-fallback]');
  if (!iframe || !fallback) return;

  let settled = false;

  const showFallback = () => {
    iframe.hidden = true;
    iframe.setAttribute('aria-hidden', 'true');
    fallback.hidden = false;
  };

  const showIframe = () => {
    iframe.hidden = false;
    iframe.removeAttribute('aria-hidden');
    fallback.hidden = true;
  };

  const onLoadSuccess = () => {
    if (settled) return;
    settled = true;
    showIframe();
  };

  const onLoadFailure = () => {
    if (settled) return;
    settled = true;
    showFallback();
  };

  showFallback();
  iframe.addEventListener('load', onLoadSuccess, { once: true });
  iframe.addEventListener('error', onLoadFailure, { once: true });

  window.setTimeout(onLoadFailure, MAP_LOAD_TIMEOUT_MS);
}

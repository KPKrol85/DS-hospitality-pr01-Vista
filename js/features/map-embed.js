const MAP_LOAD_TIMEOUT_MS = 6000;

export function initMapEmbed() {
  const map = document.querySelector('[data-map-embed]');
  if (!map) return;

  const iframe = map.querySelector('[data-map-iframe]');
  const fallback = map.querySelector('[data-map-fallback]');
  if (!iframe || !fallback) return;

  let loaded = false;

  const showFallback = () => {
    iframe.setAttribute('aria-hidden', 'true');
    iframe.inert = true;
    fallback.hidden = false;
  };

  const showIframe = () => {
    iframe.removeAttribute('aria-hidden');
    iframe.inert = false;
    fallback.hidden = true;
  };

  const onLoadSuccess = () => {
    if (loaded) return;
    loaded = true;
    window.clearTimeout(timeoutId);
    showIframe();
  };

  const onLoadFailure = () => {
    if (loaded) return;
    showFallback();
  };

  showFallback();
  iframe.addEventListener('load', onLoadSuccess, { once: true });
  iframe.addEventListener('error', onLoadFailure, { once: true });

  const timeoutId = window.setTimeout(onLoadFailure, MAP_LOAD_TIMEOUT_MS);
  iframe.hidden = false;
}

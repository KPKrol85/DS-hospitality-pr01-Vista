export function initJsonLd() {
  const meta = document.querySelector('meta[name="ld-json"]');
  if (!meta) return;

  const jsonUrl = meta.getAttribute('content');
  if (!jsonUrl) return;

  const createJsonLdScript = (payload) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(payload);
    script.dataset.seoJsonld = 'dynamic';
    document.head.appendChild(script);
  };

  const fallbackScript = document.querySelector('script[type="application/ld+json"][data-seo-jsonld="fallback"]');
  const applyJsonLdPayload = (payload) => {
    document.querySelectorAll('script[type="application/ld+json"][data-seo-jsonld="dynamic"]').forEach((script) => script.remove());

    if (Array.isArray(payload)) {
      payload.forEach((entry, index) => {
        if (index === 0 && fallbackScript) {
          fallbackScript.textContent = JSON.stringify(entry);
          return;
        }
        createJsonLdScript(entry);
      });
      return;
    }

    if (payload && typeof payload === 'object') {
      if (fallbackScript) {
        fallbackScript.textContent = JSON.stringify(payload);
      } else {
        createJsonLdScript(payload);
      }
    }
  };

  (async () => {
    try {
      const response = await fetch(jsonUrl, { credentials: 'same-origin' });
      if (!response.ok) return;
      const data = await response.json();

      applyJsonLdPayload(data);
    } catch {
    }
  })();
}

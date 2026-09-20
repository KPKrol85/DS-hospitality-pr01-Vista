

const CACHE_VERSION = "v1.2.1";
const STATIC_CACHE = `th-static-${CACHE_VERSION}`;
const HTML_CACHE = `th-html-${CACHE_VERSION}`;
const STATIC_ASSETS = [
  "index.html",
  "rooms.html",
  "offers.html",
  "gallery.html",
  "contact.html",
  "onas.html",
  "regulamin.html",
  "polityka-prywatnosci.html",
  "cookies.html",
  "404.html",
  "offline.html",
  "css/style.min.css",
  "js/theme-init.js",
  "js/script.min.js",
  "js/features/nav.js",
  "js/features/theme.js",
  "js/features/reveal.js",
  "js/features/gallery-filters.js",
  "js/features/lightbox.js",
  "js/features/form.js",
  "js/features/tabs.js",
  "js/features/compact-header.js",
  "js/features/aria-current.js",
  "js/features/seo-jsonld.js",
  "js/features/logger.js",
  "site.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => ![STATIC_CACHE, HTML_CACHE].includes(k)).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.mode === "navigate" || (req.method === "GET" && req.headers.get("accept")?.includes("text/html"))) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(HTML_CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || caches.match("offline.html");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const url = new URL(req.url);
          if (url.origin === location.origin) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});

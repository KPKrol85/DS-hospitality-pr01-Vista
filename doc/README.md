# Vista — Hotels & Travel

## PL (wersja polska)

### Przegląd projektu
Vista to statyczny, wielostronicowy serwis hotelowy oparty o HTML, CSS i JavaScript z modularnym podziałem stylów i logiki. Projekt zawiera obsługę motywów (light/dark/auto), komponenty dostępnościowe, formularz kontaktowy, galerię z lightboxem, manifest PWA oraz service worker.

### Kluczowe funkcje (na podstawie implementacji)
- Nawigacja mobilna z `aria-expanded`, obsługą `Escape` i trapem fokusu.
- Przełączanie motywu z zapisem preferencji (`localStorage`) i inicjalizacją motywu przed renderem.
- Dynamiczne ustawianie `aria-current` dla linków na podstawie ścieżki URL.
- Galeria i lightbox z nawigacją klawiaturą (`ArrowLeft/ArrowRight`, `Escape`, `Tab`).
- Formularz kontaktowy z walidacją klienta i komunikatami `aria-live`.
- JSON-LD fallback w HTML + możliwość podmiany payloadu przez `meta[name="ld-json"]`.
- PWA: `site.webmanifest` + rejestracja service workera.

### Tech stack
- HTML5 (wielostronicowy układ: `index.html`, `rooms.html`, `offers.html`, `gallery.html`, `onas.html`, `contact.html` + strony prawne i techniczne).
- CSS z modułami importowanymi przez `css/style.css`.
- Vanilla JavaScript (ES modules, podział na `js/features/*`).
- Build tooling: PostCSS, esbuild, Sharp, skrypty Node.js.
- Hosting/deploy: konfiguracja Netlify (`netlify/_headers`, `netlify/_redirects`).

### Struktura projektu (skrót)
- `css/modules/` — tokeny, layout, komponenty, sekcje, utilities, motion, print, subpages.
- `js/features/` — niezależne moduły funkcjonalne (nav, theme, form, tabs, lightbox, SEO JSON-LD itd.).
- `assets/seo/` — pliki JSON-LD per strona.
- `pwa/service-worker.js` — cache strategia i fallback offline.
- `scripts/` — narzędzia QA/build (link integrity, a11y, optimize images, dist build).

### Uruchomienie lokalne
1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Build assets:
   ```bash
   npm run build
   ```
3. Weryfikacja linków:
   ```bash
   npm run check:links
   ```

### Build i deployment
- Development korzysta z nieminifikowanych entrypointów (`css/style.css`, `js/script.js`) referowanych w HTML.
- Pipeline dystrybucyjny buduje i kopiuje zasoby do `dist` (`scripts/build-dist.mjs`, `doc/dist-notes.md`).
- W repo znajdują się pliki dla Netlify: `_headers`, `_redirects`.

### Dostępność (implementacja)
- Skip link (`.skip-link`) obecny w szablonach.
- Globalny styl `:focus-visible`.
- Tryb reduced motion (`@media (prefers-reduced-motion: reduce)`).
- Komponenty interaktywne (menu, tabs, lightbox) posiadają obsługę klawiatury i ARIA.
- No-JS baseline przez klasę `no-js` i warianty CSS.

### SEO (implementacja)
- Meta description, canonical, Open Graph i Twitter cards na stronach publicznych.
- `robots.txt` i `sitemap.xml` obecne.
- JSON-LD osadzony w każdym głównym dokumencie jako fallback, z opcjonalnym podmieniającym fetch-em.

### Wydajność (implementacja)
- Obrazy responsywne (`picture`, `srcset`, AVIF/WebP/JPG) i lazy loading obrazów poza hero.
- Lokalnie hostowane fonty z `font-display: swap`.
- Wstępne ustawienie motywu (`js/theme-init.js`) ogranicza FOUC motywu.

### Roadmap (rekomendowany kierunek)
- Ujednolicić runtime i dist asset strategy (źródła HTML vs cache SW).
- Dodać automatyczne testy CI dla linków/a11y/build.
- Rozszerzyć walidację i telemetry błędów dla modułów JS.
- Dopracować politykę nagłówków bezpieczeństwa pod finalny hosting.

### Licencja
Projekt zawiera plik `LICENSE` z licencją MIT.

---

## EN (English version)

### Project overview
Vista is a static multi-page hospitality website built with HTML, CSS, and JavaScript, using modular styles and feature-based JS modules. It includes theme switching (light/dark/auto), accessibility-focused UI patterns, contact form handling, gallery/lightbox, PWA manifest, and a service worker.

### Key implemented features
- Mobile navigation with `aria-expanded`, `Escape` handling, and focus trap.
- Theme switching with persisted preference (`localStorage`) and early theme bootstrap.
- Dynamic `aria-current` assignment based on current path.
- Gallery + lightbox with keyboard interaction (`ArrowLeft/ArrowRight`, `Escape`, `Tab`).
- Contact form with client-side validation and `aria-live` feedback.
- JSON-LD fallback in HTML with optional dynamic payload replacement.
- PWA support via `site.webmanifest` and service worker registration.

### Tech stack
- HTML5 MPA pages.
- Modular CSS imported from `css/style.css`.
- Vanilla JS ES modules under `js/features/`.
- Tooling: PostCSS, esbuild, Sharp, Node scripts.
- Netlify deployment artifacts (`netlify/_headers`, `netlify/_redirects`).

### Structure overview
- `css/modules/` — tokens, layout, components, utilities, motion, etc.
- `js/features/` — isolated modules (navigation, theme, form, tabs, lightbox, SEO JSON-LD).
- `assets/seo/` — per-page JSON-LD payloads.
- `pwa/service-worker.js` — cache and offline behavior.
- `scripts/` — build and QA scripts.

### Setup & run
```bash
npm install
npm run build
npm run check:links
```

### Build/deployment notes
- HTML files currently load non-minified runtime assets (`css/style.css`, `js/script.js`).
- Dist pipeline generates/copies production artifacts and deployment files.
- Netlify routing/header files are included in repository.

### Accessibility notes
- Skip links implemented.
- Global `:focus-visible` style implemented.
- Reduced-motion rules implemented.
- Keyboard and ARIA support included for key interactive components.
- No-JS baseline is explicitly handled.

### SEO notes
- Canonical, robots, Open Graph, and Twitter metadata are present.
- `robots.txt` references `sitemap.xml`.
- JSON-LD fallback script is present in page heads.

### Performance notes
- Responsive images with modern formats.
- Explicit image dimensions are present in template images.
- Fonts use `font-display: swap`.
- Theme pre-init script reduces theme flash.

### Roadmap
- Align runtime asset references with service worker caching strategy.
- Add CI-level checks for accessibility and link integrity.
- Improve resilience/observability for JS module failures.
- Finalize production security headers policy.

### License
MIT (see `LICENSE`).

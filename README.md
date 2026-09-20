# Vista

## PL

### Przegląd projektu

Vista Hotels & Travel to demonstracyjny, statyczny serwis wielostronicowy dla fikcyjnej marki hotelarskiej. Prezentuje pokoje, oferty, galerię, informacje o projekcie i formularz zapytania. Nie realizuje automatycznych rezerwacji ani płatności. Kod formularza jest przygotowany do obsługi zapytań przez Netlify Forms; sama konfiguracja nie potwierdza dostarczania wiadomości z publicznego wdrożenia.

### Kluczowe funkcje

- Filtrowanie pokoi i galerii, panele kart oraz galeria z podglądem typu lightbox.
- Motyw jasny, ciemny i automatyczny; wybór jasnego lub ciemnego motywu jest zapisywany lokalnie w przeglądarce.
- Formularz zapytania z walidacją JavaScript, polami terminu pobytu i znacznikiem Netlify Forms. Wysłanie zapytania nie stanowi rezerwacji.
- Osadzona mapa Google na stronie kontaktowej ze statycznym widokiem zastępczym.

### Stack technologiczny

- HTML, modułowy CSS i JavaScript bez frameworka aplikacyjnego.
- Node.js i npm do obsługi skryptów; PostCSS (`postcss-import`, Autoprefixer, cssnano) oraz esbuild do budowania zasobów.
- Sharp do przygotowywania obrazów; Playwright i axe-core w skonfigurowanym skrypcie kontroli dostępności.

### Struktura projektu

```text
.
├── index.html
├── rooms.html
├── gallery.html
├── contact.html
├── css/
├── js/
├── assets/
├── pwa/
├── scripts/
├── netlify/
└── site.webmanifest
```

Pozostałe pliki HTML w katalogu głównym obejmują oferty, stronę o projekcie, dokumenty prawne oraz strony błędu i trybu offline. Źródłowe style zaczynają się w `css/style.css` i `css/modules/`, a logika w `js/script.js` i `js/features/`. Obrazy wejściowe znajdują się w `assets/img/src/`, przygotowane warianty w `assets/img/optimized/`, a dane strukturalne stron w `assets/seo/`.

### Instalacja

Projekt używa npm i zawiera `package-lock.json`:

```bash
npm ci
```

### Build produkcyjny

Po zmianie obrazów źródłowych można odtworzyć ich warianty, a następnie zbudować zasoby i pakiet dystrybucyjny:

```bash
npm run img:opt
npm run build
```

`npm run build` tworzy `css/style.min.css` i `js/script.min.js`, po czym `scripts/build-dist.mjs` przygotowuje ignorowany przez Git katalog `dist/`. Podczas pakowania skrypt przepisuje odwołania w źródłowych stronach HTML na minifikowane zasoby, kopiuje wybrane pliki i generuje wersję `pwa/service-worker.js` dla `dist/`. Samo `npm run build:dist` wykorzystuje już istniejące pliki `.min`, dlatego po zmianach CSS lub JavaScript potrzebny jest pełny build. Źródłowe strony HTML odwołują się do `css/style.css` i `js/script.js`; plików w `dist/` nie należy edytować ręcznie.

### Testy i walidacja

```bash
npm run check:links
npm run test:a11y
```

`check:links` sprawdza lokalne odwołania w głównych stronach HTML i ścieżki z `sitemap.xml`. `test:a11y` konfiguruje scenariusze Playwright z axe-core i może pobrać wymagane pakiety przez `npm exec --yes`. Skrypt `npm test` jest placeholderem, który kończy się błędem.

### Wdrożenie

`scripts/build-dist.mjs` kopiuje `netlify/_headers` i `netlify/_redirects` do katalogu `dist/`, jeśli pliki są dostępne. Repozytorium zawiera więc konfigurację dla Netlify, lecz sam kod nie potwierdza aktualnie działającego wdrożenia ani dostarczania formularza na żywej stronie.

### Dostępność

Strony zawierają link pomijający nawigację, widoczne style `:focus-visible`, reguły `prefers-reduced-motion` oraz obsługę klawiatury w menu, kartach i lightboksie. Walidacja formularza aktualizuje `aria-invalid` i komunikaty `aria-live`. Aktualne style ukrywają elementy `data-reveal` do czasu ich odsłonięcia przez JavaScript, a `novalidate` w formularzu wyłącza natywną walidację przeglądarki. Te mechanizmy nie stanowią deklaracji zgodności z WCAG.

### SEO

Strony mają tytuły, opisy, adresy canonical, metadane Open Graph i Twitter oraz osadzone dane JSON-LD. `assets/seo/` zawiera dodatkowe dane ładowane przez JavaScript; w repozytorium są także `robots.txt` i `sitemap.xml`.

### PWA i obsługa offline

`site.webmanifest` definiuje ikony, skróty i widok aplikacji. `js/script.js` rejestruje `pwa/service-worker.js`; worker buforuje zasoby, zapamiętuje odwiedzone strony HTML i w razie nieudanej nawigacji próbuje wyświetlić stronę z pamięci lub `offline.html`. Generator `dist/` ustala wersję pamięci podręcznej na podstawie stron HTML i wybranych plików statycznych. Zachowanie offline zależy od wcześniejszej instalacji workera i zawartości pamięci przeglądarki.

### Wydajność

Strony używają obrazów `picture`/`srcset` w formatach AVIF, WebP i formacie zastępczym, a skrypt Sharp przygotowuje warianty z `assets/img/src/`. Fonty są hostowane lokalnie i używają `font-display: swap`.

### Dane i trwałość stanu

`localStorage` przechowuje preferencję motywu (`theme-pref`) i zamknięcie informacji o charakterze projektu (`vista_project_banner_accepted`). Service worker korzysta z Cache Storage dla zasobów i stron HTML. Formularz nie zapisuje rezerwacji w aplikacji; jest skonfigurowany jako zapytanie dla Netlify Forms.

### Licencja

Oryginalne materiały projektu są objęte własnościowymi warunkami KP_Code opisanymi w [LICENSE](LICENSE). Materiały podmiotów trzecich podlegają ich odrębnym licencjom.

## EN

### Project Overview

Vista Hotels & Travel is a demonstrational static multi-page site for a fictional hospitality brand. It presents rooms, offers, a gallery, project information, and an inquiry form. It does not process automatic reservations or payments. The form markup is configured for inquiries through Netlify Forms; configuration alone does not confirm message delivery from a public deployment.

### Key Features

- Room and gallery filtering, tab panels, and a gallery lightbox.
- Light, dark, and automatic themes; a light or dark preference is stored locally in the browser.
- An inquiry form with JavaScript validation, stay-date fields, and Netlify Forms markup. Submitting an inquiry does not create a reservation.
- An embedded Google map on the contact page with a static fallback view.

### Tech Stack

- HTML, modular CSS, and JavaScript without an application framework.
- Node.js and npm for scripts; PostCSS (`postcss-import`, Autoprefixer, cssnano) and esbuild for asset builds.
- Sharp for image preparation; Playwright and axe-core in the configured accessibility check script.

### Project Structure

```text
.
├── index.html
├── rooms.html
├── gallery.html
├── contact.html
├── css/
├── js/
├── assets/
├── pwa/
├── scripts/
├── netlify/
└── site.webmanifest
```

Other root HTML files cover offers, project information, legal documents, and error and offline pages. Canonical styles start in `css/style.css` and `css/modules/`, while behavior starts in `js/script.js` and `js/features/`. Input images are in `assets/img/src/`, prepared variants in `assets/img/optimized/`, and per-page structured data in `assets/seo/`.

### Installation

The project uses npm and includes `package-lock.json`:

```bash
npm ci
```

### Production Build

After changing source images, their variants can be regenerated before building assets and the distribution package:

```bash
npm run img:opt
npm run build
```

`npm run build` creates `css/style.min.css` and `js/script.min.js`, then `scripts/build-dist.mjs` prepares the Git-ignored `dist/` directory. Packaging rewrites source HTML references to minified assets, copies selected files, and generates a `pwa/service-worker.js` version for `dist/`. Running `npm run build:dist` alone uses the existing `.min` files, so a full build is needed after CSS or JavaScript changes. Source HTML pages reference `css/style.css` and `js/script.js`; files in `dist/` should not be edited manually.

### Testing and Validation

```bash
npm run check:links
npm run test:a11y
```

`check:links` checks local references in root HTML pages and paths in `sitemap.xml`. `test:a11y` configures Playwright scenarios with axe-core and may download required packages through `npm exec --yes`. The `npm test` script is a placeholder that exits with an error.

### Deployment

`scripts/build-dist.mjs` copies `netlify/_headers` and `netlify/_redirects` into `dist/` when they are present. The repository therefore includes Netlify configuration, but the code alone does not confirm an active deployment or live form delivery.

### Accessibility

Pages include a skip link, visible `:focus-visible` styles, `prefers-reduced-motion` rules, and keyboard handling for the menu, tabs, and lightbox. Form validation updates `aria-invalid` and `aria-live` messages. Current styles hide `data-reveal` elements until JavaScript reveals them, and the form's `novalidate` attribute disables native browser validation. These mechanisms are not a claim of WCAG conformance.

### SEO

Pages include titles, descriptions, canonical URLs, Open Graph and Twitter metadata, and embedded JSON-LD. `assets/seo/` holds additional data loaded by JavaScript; the repository also contains `robots.txt` and `sitemap.xml`.

### PWA and Offline Support

`site.webmanifest` defines icons, shortcuts, and an app display mode. `js/script.js` registers `pwa/service-worker.js`; the worker caches assets, saves visited HTML pages, and attempts to serve a cached page or `offline.html` after a failed navigation. The `dist/` generator derives the cache version from HTML pages and selected static files. Offline behavior depends on prior worker installation and browser cache contents.

### Performance

Pages use `picture`/`srcset` images in AVIF, WebP, and fallback formats, while the Sharp script prepares variants from `assets/img/src/`. Fonts are hosted locally and use `font-display: swap`.

### Data and State Persistence

`localStorage` stores the theme preference (`theme-pref`) and dismissal of the project notice (`vista_project_banner_accepted`). The service worker uses Cache Storage for assets and HTML pages. The form does not save reservations in the application; it is configured as a Netlify Forms inquiry.

### License

Original project materials are governed by the KP_Code proprietary terms in [LICENSE](LICENSE). Third-party materials remain subject to their separate licenses.

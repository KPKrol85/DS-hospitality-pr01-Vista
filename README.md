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

### Praca lokalna

Uruchom pliki HTML z katalogu głównego przez lokalny serwer HTTP. Strony źródłowe ładują czytelne `css/style.css` i `js/script.js` wraz z modułami JavaScript. Nie wymagają wygenerowanych plików `.min` ani wcześniejszego buildu. W tym trybie nie jest automatycznie rejestrowany produkcyjny Service Worker. Kod deweloperski sprawdza i usuwa wcześniejszą rejestrację Vista dla jej właściwego zakresu oraz pamięci podręczne należące do Vista, jeśli pozostały po uruchomieniu produkcyjnego pakietu na tym samym originie.

### Build produkcyjny

Po zmianie obrazów źródłowych można odtworzyć ich warianty, a następnie zbudować pełny pakiet dystrybucyjny:

```bash
npm run img:opt
npm run build
```

`npm run build` jest aliasem `npm run build:dist`. Obie komendy czyszczą `dist/`, generują z aktualnych źródeł `dist/css/style.min.css` i `dist/js/script.min.js`, pakują wymagane pliki publiczne, przepisują odwołania w kopiach HTML i weryfikują wynik. Produkcyjny HTML otrzymuje znacznik `data-vista-build="production"`, który steruje rejestracją Service Workera. Worker powstaje po przygotowaniu zasobów pakietu. `npm run build:css` i `npm run build:js` tworzą osobne pliki w `dist/` bez czyszczenia pozostałej zawartości; `npm run dist:clean` usuwa tylko wygenerowany katalog `dist/`. Plików w `dist/` nie należy edytować ręcznie ani dodawać do repozytorium.

### Testy i walidacja

```bash
npm run check:links
npm run test:a11y
```

`check:links` sprawdza lokalne odwołania w głównych stronach HTML i ścieżki z `sitemap.xml`. `test:a11y` konfiguruje scenariusze Playwright z axe-core i może pobrać wymagane pakiety przez `npm exec --yes`. Skrypt `npm test` jest placeholderem, który kończy się błędem.

### Wdrożenie

`netlify.toml` ustawia polecenie buildu na `npm run build` i katalog publikacji na `dist/`; wygenerowane pliki nie muszą być dodawane do Git. Skrypt kopiuje `netlify/_headers` i `netlify/_redirects` do tego katalogu. Repozytorium zawiera konfigurację dla Netlify, lecz sam kod nie potwierdza aktualnie działającego wdrożenia ani dostarczania formularza na żywej stronie.

### Dostępność

Strony zawierają link pomijający nawigację, widoczne style `:focus-visible`, reguły `prefers-reduced-motion` oraz obsługę klawiatury w menu, kartach i lightboksie. Treści oznaczone `data-reveal` są domyślnie widoczne i pozostają widoczne bez JavaScript lub przy nieudanej inicjalizacji reveal; animacje są włączane dopiero po pomyślnym uruchomieniu tego rozszerzenia.

Natywne ograniczenia HTML formularza zapytania pozostają aktywne bez JavaScript lub przy nieudanej inicjalizacji rozszerzonej walidacji; sam statyczny HTML nie wyznacza zmieniającej się wraz z bieżącą datą minimalnej daty przyjazdu. Po pomyślnej inicjalizacji JavaScript przejmuje walidację, aktualizuje `aria-invalid` i komunikaty błędów `aria-live` oraz sprawdza datę przyjazdu względem bieżącej daty lokalnej przeglądarki, odświeżanej przy wysyłaniu. Netlify Edge Function odrzuca na ścieżce wysyłania zapytań `booking` nieprawidłowe i przeszłe daty przyjazdu, także w żądaniach bez JavaScript. Używa daty w strefie `Europe/Warsaw`, która może różnić się od daty lokalnej przeglądarki. Wysłanie zapytania nie rezerwuje noclegu.

Te mechanizmy nie stanowią deklaracji zgodności z WCAG.

### SEO

Strony mają tytuły, opisy, adresy canonical, metadane Open Graph i Twitter oraz osadzone dane JSON-LD. `assets/seo/` zawiera dodatkowe dane ładowane przez JavaScript; w repozytorium są także `robots.txt` i `sitemap.xml`.

### PWA i obsługa offline

`site.webmanifest` definiuje ikony, skróty i widok aplikacji. Rejestracja `pwa/service-worker.js` jest aktywna tylko dla HTML z produkcyjnym znacznikiem `data-vista-build="production"`, także przy lokalnym serwowaniu `dist/`. Produkcyjny worker jest generowany z plików obecnych w pakiecie; buforuje zasoby, zapamiętuje odwiedzone strony HTML i w razie nieudanej nawigacji próbuje wyświetlić stronę z pamięci lub `offline.html`. Wersja pamięci podręcznej zależy od zawartości odpowiednich plików produkcyjnych. Zachowanie offline zależy od wcześniejszej instalacji workera i zawartości pamięci przeglądarki.

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

### Local Development

Serve the root HTML files over a local HTTP server. Source pages load readable `css/style.css` and `js/script.js` with JavaScript modules. They do not require generated `.min` files or an earlier build. The production service worker is not registered automatically in this mode. Development code checks for and removes an earlier Vista registration within its intended scope and Vista-owned caches if they remain after serving the production package on the same origin.

### Production Build

After changing source images, their variants can be regenerated before building the full distribution package:

```bash
npm run img:opt
npm run build
```

`npm run build` is an alias for `npm run build:dist`. Both commands clean `dist/`, generate `dist/css/style.min.css` and `dist/js/script.min.js` from current sources, package the required public files, rewrite references in copied HTML, and verify the result. Production HTML receives a `data-vista-build="production"` marker that controls service worker registration. The worker is generated after the package assets are prepared. `npm run build:css` and `npm run build:js` create their individual files in `dist/` without cleaning other output; `npm run dist:clean` removes only the generated `dist/` directory. Files in `dist/` should not be edited manually or committed.

### Testing and Validation

```bash
npm run check:links
npm run test:a11y
```

`check:links` checks local references in root HTML pages and paths in `sitemap.xml`. `test:a11y` configures Playwright scenarios with axe-core and may download required packages through `npm exec --yes`. The `npm test` script is a placeholder that exits with an error.

### Deployment

`netlify.toml` sets the build command to `npm run build` and the publish directory to `dist/`; generated files do not need to be committed. The script copies `netlify/_headers` and `netlify/_redirects` into that directory. The repository includes Netlify configuration, but the code alone does not confirm an active deployment or live form delivery.

### Accessibility

Pages include a skip link, visible `:focus-visible` styles, `prefers-reduced-motion` rules, and keyboard handling for the menu, tabs, and lightbox. Content marked with `data-reveal` is visible by default and remains visible without JavaScript or if reveal initialization fails; animations are enabled only after successful enhancement.

The inquiry form's native HTML constraints remain active without JavaScript or if enhanced validation initialization fails; static HTML alone does not provide a minimum arrival date that advances with the current date. After successful initialization, JavaScript takes over validation, updates `aria-invalid` and `aria-live` error messages, and checks the arrival date against the current browser-local date, refreshed on submission. The Netlify Edge Function rejects invalid and past arrival dates on the `booking` inquiry submission path, including requests made without JavaScript. It uses the date in `Europe/Warsaw`, which may differ from the browser-local date. Submitting an inquiry does not reserve accommodation.

These mechanisms are not a claim of WCAG conformance.

### SEO

Pages include titles, descriptions, canonical URLs, Open Graph and Twitter metadata, and embedded JSON-LD. `assets/seo/` holds additional data loaded by JavaScript; the repository also contains `robots.txt` and `sitemap.xml`.

### PWA and Offline Support

`site.webmanifest` defines icons, shortcuts, and an app display mode. Registration of `pwa/service-worker.js` is active only for HTML with the `data-vista-build="production"` marker, including when `dist/` is served locally. The production worker is generated from files present in the package; it caches assets, saves visited HTML pages, and attempts to serve a cached page or `offline.html` after a failed navigation. Its cache version depends on the relevant production content. Offline behavior depends on prior worker installation and browser cache contents.

### Performance

Pages use `picture`/`srcset` images in AVIF, WebP, and fallback formats, while the Sharp script prepares variants from `assets/img/src/`. Fonts are hosted locally and use `font-display: swap`.

### Data and State Persistence

`localStorage` stores the theme preference (`theme-pref`) and dismissal of the project notice (`vista_project_banner_accepted`). The service worker uses Cache Storage for assets and HTML pages. The form does not save reservations in the application; it is configured as a Netlify Forms inquiry.

### License

Original project materials are governed by the KP_Code proprietary terms in [LICENSE](LICENSE). Third-party materials remain subject to their separate licenses.

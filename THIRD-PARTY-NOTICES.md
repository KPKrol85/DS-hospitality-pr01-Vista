# Third-Party Notices — Vista Hotels & Travel

This document records attribution and redistribution notices for materials used by Vista Hotels & Travel. Sections 3 and 8 of the proprietary project license recognize the separate terms governing third-party materials. [KP_Code Proprietary Project License](LICENSE.md)

**Scope (PL)** — Licencja KP_Code obejmuje materiały własne projektu w zakresie określonym w `LICENSE.md`. Do materiałów podmiotów trzecich stosuje się właściwe im licencje i warunki. Dokument podaje ustalone źródła, informacje licencyjne i ograniczenia weryfikacji.

## Fonts

All four local WOFF2 files match the linked Google Fonts binaries byte for byte. They are static webfont subsets with a historical `var` suffix in their filenames. The SIL Open Font License (OFL) 1.1 requires the copyright notice and license to accompany redistributed copies. [SIL Open Font License](https://openfontlicense.org/)

### Inter

- [Inter Regular](assets/fonts/inter-v-var-400.woff2) and [Inter Medium](assets/fonts/inter-v-var-500.woff2) have weights 400 and 500. Both report `Version 4.001;git-66647c0bb`. [Google Fonts v20 Regular](https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZFhiA.woff2) · [Google Fonts v20 Medium](https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZFhiA.woff2)
- The embedded notice is `Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)`. The Google Fonts license file credits the same authors with a 2020 notice. The Inter project identifies “Inter” as a Reserved Font Name. Vista distributes the matched Google Fonts subsets as supplied. [Inter upstream README](https://raw.githubusercontent.com/rsms/inter/66647c0bb/README.md) · [Included Inter OFL 1.1](assets/fonts/Inter-OFL.txt) · [Google Fonts license source](https://raw.githubusercontent.com/google/fonts/e1d648010/ofl/inter/OFL.txt)

### Manrope

- [Manrope SemiBold](assets/fonts/manrope-v-var-600.woff2) and [Manrope Bold](assets/fonts/manrope-v-var-700.woff2) have weights 600 and 700. Both report `Version 4.504` and match the bytes served from Google Fonts CDN versions `v19` and `v20`. [Google Fonts v20 SemiBold](https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4jE9_M-bk.woff2) · [Google Fonts v20 Bold](https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4aE9_M-bk.woff2)
- The embedded notice is `Copyright 2019 The Manrope Project Authors (https://github.com/sharanda/manrope)`. The Google Fonts license for 4.504 credits the same authors with a 2018 notice and declares no Reserved Font Name. Vista distributes the matched Google Fonts subsets as supplied. [Manrope upstream](https://github.com/googlefonts/manrope) · [Included Manrope OFL 1.1](assets/fonts/Manrope-OFL.txt) · [Google Fonts license source](https://raw.githubusercontent.com/google/fonts/8f9a401dbb3793e0/ofl/manrope/OFL.txt)

## Icons

Nine symbols match the geometry of filled Tabler Icons in v3.34.1. The original import source and version remain unverified. Vista wraps the paths in named SVG symbols with project IDs and styling and omits the upstream wrappers and source comments. [Vista sprite](assets/img/icons/sprite.svg)

| Vista symbol | Compared Tabler file |
| --- | --- |
| `icon-arrow-left` | [square-rounded-arrow-left](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/filled/square-rounded-arrow-left.svg) |
| `icon-arrow-right` | [square-rounded-arrow-right](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/filled/square-rounded-arrow-right.svg) |
| `icon-phone` | [phone](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/filled/phone.svg) |
| `icon-email` | [mail](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/filled/mail.svg) |
| `icon-facebook` | [brand-facebook](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/filled/brand-facebook.svg) |
| `icon-x` | [brand-x](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/filled/brand-x.svg) |
| `icon-github` | [brand-github](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/filled/brand-github.svg) |
| `icon-linkedin` | [brand-linkedin](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/filled/brand-linkedin.svg) |
| `icon-instagram` | [brand-instagram](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/filled/brand-instagram.svg) |

The matched Tabler geometry is published under MIT, `Copyright (c) 2020-2024 Paweł Kuna`. Redistributed copies retain the copyright and permission notices. Trademark rights remain with the owners of the corresponding marks, and brand guidelines apply separately to their use. [Included Tabler Icons MIT](assets/img/icons/Tabler-Icons-MIT.txt) · [Upstream license](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/LICENSE) · [Facebook](https://www.meta.com/brand/resources/facebook/logo/) · [Instagram](https://www.meta.com/brand/resources/instagram/instagram-brand/) · [X](https://about.x.com/en/who-we-are/brand-toolkit) · [GitHub](https://brand.github.com/foundations/logo) · [LinkedIn](https://brand.linkedin.com/)

## Images and Graphics

- The project owner confirms that the photography and both Open Graph graphics were generated using ChatGPT. All 32 production photo masters contain C2PA data naming ChatGPT. Verification covered the embedded metadata. C2PA signatures and rights to any third-party inputs remain unverified. [OpenAI content provenance](https://developers.openai.com/api/docs/guides/content-provenance) · [OpenAI Europe Terms of Use](https://openai.com/policies/eu-terms-of-use/)
- The repository keeps the production photography masters under `assets/img/src/hero/`, `assets/img/src/about/`, `assets/img/src/rooms/`, `assets/img/src/gallery/` and `assets/img/src/subpage-gallery/`. The image pipeline creates distributed JPEG, WebP and AVIF variants under `assets/img/optimized/`. The fixture under `assets/img/src/test/` and its variants under `assets/img/optimized/test/` are repository-only. The [landscape Open Graph graphic](assets/img/og/og-1200x630.jpg) and [square Open Graph graphic](assets/img/og/og-1200x1200.jpg) are distributed separately.
- The project owner confirms creating the Vista logo in Canva and preparing and editing the PWA graphics and related assets. Canva export metadata is present in the [512 px logo](assets/img/logo/logo-512x512.png), the [1024 px favicon](assets/img/ui/favicon-1024x1024.png), and the [gallery](assets/img/shortcuts/galeria.png), [contact](assets/img/shortcuts/kontakt.png) and [rooms](assets/img/shortcuts/pokoje.png) shortcut graphics. The [SVG favicon](assets/img/ui/favicon.svg) embeds a byte-identical copy of the 512 px logo. The SVG logos and the favicon and manifest icon variants share Vista branding. [Canva Content License Agreement](https://www.canva.com/policies/content-license-agreement/)
- The [desktop](assets/img/screenshots/desktop.jpg) and [mobile](assets/img/screenshots/mobile.jpg) PWA screenshots reproduce the Vista site, including its logo, hero photography and interface artwork. The manifest references both screenshots, the app icons and the three shortcut graphics. [Web app manifest](site.webmanifest)
- The project owner confirms that the [local contact map](assets/img/ui/map-fallback.svg) is a custom demonstration schematic. A separate schematic at `assets/img/src/contact/map-fallback.svg` is repository-only. The contact page links to Google Maps as an external service.

## Development Dependencies

The npm tooling is declared in `devDependencies` and resolved in the repository’s `package-lock.json`. The production build processes local CSS and bundles local JavaScript modules. It packages the public assets and their notices. The npm installation and canonical photo masters stay outside the current public package.

The repository’s `netlify/edge-functions/validate-booking-date.js` uses platform APIs without package imports. The repository’s `deno.lock` records Netlify bootstrap references and workspace metadata. Netlify Edge Functions and Forms run as managed services outside the public static package. [Netlify Edge Functions](https://docs.netlify.com/build/edge-functions/api/) · [Netlify Forms](https://docs.netlify.com/manage/forms/setup/)

## Unverified Provenance

The project owner recalls preparing an SVG icon collection in Figma using materials understood to be freely available. The original sources and license terms remain unverified for the unidentified icons.

| Material | Evidence and limitations |
| --- | --- |
| `icon-menu`, `icon-close` in `assets/img/icons/sprite.svg` | The simple segments match Feather menu and close examples. The close paths also match Tabler `outline/x`. The original import source remains unverified. [Feather menu](https://raw.githubusercontent.com/feathericons/feather/v4.29.2/icons/menu.svg) · [Feather x](https://raw.githubusercontent.com/feathericons/feather/v4.29.2/icons/x.svg) · [Tabler x](https://raw.githubusercontent.com/tabler/tabler-icons/v3.34.1/icons/outline/x.svg) |
| `icon-location`, `icon-comfort`, `icon-dining`, `icon-service` in `assets/img/icons/sprite.svg` | The source and applicable license remain unverified. |
| `assets/img/icons/moon-40x40.svg`, `assets/img/icons/sun-40x40.svg`, `assets/img/icons/travel-160x160.svg` | The theme graphics contain embedded PNG artwork. The travel geometry also appears in repository history. The artwork sources and applicable terms remain unverified. |
| Social platform symbols in `assets/img/icons/sprite.svg` | The Tabler geometry is identified. Permission to display and redistribute the marks in their current form remains unverified under the respective brand rules. |
| `assets/img/logo/`, favicon and PWA icons in `assets/img/ui/`, and `assets/img/shortcuts/` | Owner confirmation and Canva metadata document preparation and export. The source and terms of any third-party artwork or stock elements used as inputs remain unverified. The favicon generator and full derivation chain remain unverified. |
| Production photography masters and both `assets/img/og/` graphics | The owner confirms ChatGPT generation for both groups. The production photography masters carry supporting metadata. Rights to any third-party inputs and exclusive ownership remain unverified. |

Redistribution of materials with unresolved provenance requires evidence of the applicable rights.

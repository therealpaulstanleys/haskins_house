# Haskins House Records — theme drafts

Local static drafts for **Haskins House Records** review. CloudAgent/GitHub is not used; everything lives on the shared box under this folder.

## Brand chrome (use exactly)

- **Haskins House Records** — Vinyl & Vintage Clothes Mix
- Buy Sell Trade
- Call/Text **740-771-0017**
- **534 2nd Street, Portsmouth, OH 45662**

Do not invent additional brand voice, artists, or contact info beyond these facts. Catalog titles/artists in demos remain **fictional placeholders**.

## How to open

From this project root:

```bash
npx serve /workspace/haskins-house-records -p 4173
```

Then visit `http://localhost:4173/` for the theme picker, or open any theme’s `index.html` via relative links from the picker.

No npm install or build step. Theme “Spatial Vinyl Wall” loads Three.js from a CDN at runtime.

## Print / brand directions (new)

Web Design comps copied into `assets/` (`warhol-cassette-grid.png`, `warhol-site-ref.png`, `risograph-ref.png`, `mint-home-ref.png`). Cropped marks: `logo-cassette.png`, `logo-toad.png` (toad crop is approximate — theme also uses the full risograph ref as chrome art).

| Path | What it proves |
|------|----------------|
| `themes/warhol-splash/` | Full-bleed 3×3 cassette grid splash; optional Shop CTA; light chrome facts strip — not a full shop. |
| `themes/warhol-hero/` | Black nav (Shop Vinyl / Vintage / Buy Sell Trade); hero = cassette grid; bottom New Arrivals \| Shop Now bars; placeholder product grids. |
| `themes/risograph-zine/` | Red/lime zine shop; toad mark in chrome; torn-paper cards; DIY product cards + bag badge. |
| `themes/mint-cassette/` | Mint hero with cassette logo; black nav Dig Vinyl / Vintage / Buy Sell Trade / Bag; dual grids Vinyl + Vintage Clothes (clothes = CSS color blocks, no invented product photos). |

## Earlier interactive demos

| Path | What it proves |
|------|----------------|
| `themes/label-chromatic/` | Magazine-style teal/coral/yellow blocks; story cards expand one-at-a-time; add-to-bag flies a color chip into the cart badge with a bounce; category filter (New / Vinyl / Merch); soft page-tint on hero color-block hover. |
| `themes/spatial-dig/` | Dark void + 3D sleeve wall (Three.js CDN) with raycaster hover/click; Grid toggle + text search in both modes; cart and detail overlay stay 2D; if Three.js/WebGL fails, only the 2D grid is shown. |
| `themes/underground-editorial/` | Genre rooms as chapters (`slug`, title, essay HTML, `records[]`); hash / `data-room` nav without reload; IntersectionObserver scroll-spy; sleeve grid sort (curated / price / year) independent of the essay. |

## Catalog note

All catalog data, artists, albums, rooms, and stories are **fictional placeholders**. This draft does not claim real inventory or real brand voice beyond the chrome facts above (marks **HH** / **HHR** and cassette/toad art where applicable).

## Source

Earlier demos copied from read-only demos under `/workspace/vinyl-theme-demos/` (`03-label-chromatic`, `04-spatial-dig`, `06-underground-editorial`). Those originals are not edited. Print/brand directions are new vanilla HTML/CSS/JS matching local Web Design comps.

## Theme picker

The root `index.html` + `picker.css` are a visual launcher only (grouped: Print / brand directions vs Earlier interactive demos). They do not change storefront CSS/JS under `themes/`.

## Status

**Draft for review** — four new print/brand comps plus three earlier interactive demos.

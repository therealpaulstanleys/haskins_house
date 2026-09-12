# Haskins House Records — theme drafts

Local static draft of three vinyl-shop UI themes, rebranded for **Haskins House Records** review. CloudAgent/GitHub is not used; everything lives on the shared box under this folder.

## How to open

From this project root:

```bash
npx serve /workspace/haskins-house-records -p 4173
```

Then visit `http://localhost:4173/` for the theme picker, or open any theme’s `index.html` directly in a browser (file:// works for Themes 1 and 3; Theme “Spatial Vinyl Wall” needs a server or network access for the Three.js CDN).

No npm install or build step. Theme “Spatial Vinyl Wall” loads Three.js from a CDN at runtime.

## Themes

| Path | What it proves |
|------|----------------|
| `themes/label-chromatic/` | Magazine-style teal/coral/yellow blocks; story cards expand one-at-a-time; add-to-bag flies a color chip into the cart badge with a bounce; category filter (New / Vinyl / Merch); soft page-tint on hero color-block hover. |
| `themes/spatial-dig/` | Dark void + 3D sleeve wall (Three.js CDN) with raycaster hover/click; Grid toggle + text search in both modes; cart and detail overlay stay 2D; if Three.js/WebGL fails, only the 2D grid is shown. |
| `themes/underground-editorial/` | Genre rooms as chapters (`slug`, title, essay HTML, `records[]`); hash / `data-room` nav without reload; IntersectionObserver scroll-spy; sleeve grid sort (curated / price / year) independent of the essay. |

## Catalog note

All catalog data, artists, albums, rooms, and stories are **fictional placeholders**. This draft does not claim real inventory or real brand voice beyond shop chrome renamed to Haskins House Records (marks **HH** / **HHR** where applicable).

## Source

Copied from read-only demos under `/workspace/vinyl-theme-demos/` (`03-label-chromatic`, `04-spatial-dig`, `06-underground-editorial`). Those originals are not edited.

## Theme picker

The root `index.html` + `picker.css` are a visual launcher only (HH mark, fictional-catalog disclaimer, bold mini-previews per theme). They do not change storefront CSS/JS under `themes/`.

## Status

**Draft for review** — IA and unique JS behaviors preserved; only demo shop branding strings were rebranded.

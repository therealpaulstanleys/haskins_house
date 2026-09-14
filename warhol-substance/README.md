# Haskins House Records — Warhol Substance Pages

Three self-contained vanilla HTML/CSS/JS demos in an Andy Warhol silk-screen style.

**Brand:** Haskins House Records · Vinyl & Vintage Clothes Mix · Buy Sell Trade  
**Phone:** 740-771-0017  
**Address:** 534 2nd Street, Portsmouth, OH 45662

## How to open

No build step. Either:

```bash
# From this folder
npx --yes serve .
# then visit /01-substance-grid/  /02-shop/  /03-pdp/
```

Or open each `index.html` directly in a browser (file:// works; relative asset paths).

## Pages

| Folder | What it does |
|--------|----------------|
| `01-substance-grid/` | Interactive 3×3 Warhol grid (cassette, toad, vinyl, jacket, cassette alt, storefront, BST stamp, toad alt, clothes rack). Click a cell for overlay detail + Add interest; Esc closes. |
| `02-shop/` | Full shop: header, toad+cassette hero diptych, VINYL / VINTAGE / BUY SELL TRADE columns, footer address. Add buttons bump a bag badge; optional cart panel. |
| `03-pdp/` | Record PDP for fictional “The Toad Sessions” by DJ Ribbit ($28). Four colorway thumbs swap sleeve filters; Add to bag + Listen preview stub; pressing notes + stamps. |

Catalog artists/titles are fictional. Logo assets under `assets/` are real brand files (toad, cassette, storefront, substance mockup refs).

## Shared styles

`styles/warhol.css` — color tokens, silk-screen helpers, buttons, header/footer. Each page also has page-local CSS in its `index.html`.

# Jiggle Clicker

Pink-themed three.js clicker game. Vite + ES modules, `three@0.128.0` from npm, fonts bundled locally (@fontsource), fully offline.

## Build
```bash
npm install
npm run dev        # dev server
npm run build      # dist/ (multi-file) + dist-single/index.html (one self-contained file, works from file://)
```

## Layout (`src/game/`, stitched in `manifest.json` order by `vite.config.js`)
| folder | what |
|---|---|
| `core/` | quality presets (low/med/high/auto), scene, renderer, lights, backdrop |
| `body/` | parametric torso geometry, body mesh, thighs |
| `textures/` | procedural skin, lace, tulle |
| `physics/` | chest springs + contact, levels/level-up, grab & drag input |
| `garments/` | shared builders, bra/panty builders, `registry.js` + `items/<id>.js` (one file per item) |
| `economy/` | `config.js` (upgrades, generators, prices, level curve, garment catalogue), achievements |
| `save/` | versioned save (`state.v`, migrations); storage key stays `clicker3d_save_v1` |
| `ui/` | shop, wardrobe (Bras / Panties tabs), admin, settings (quality toggle) |
| `main/` | animation loop |

Add a garment: add a data row to `economy/config.js` (`GARMENTS` or `PANTIES`), add `garments/items/<id>.js` with `BUILD.<id>=m=>{...}`, and list the file in `manifest.json`.

Note: the files share one scope (the code started as one script). The plugin concatenates them into a single ES module.

## Android
`android/` holds a minimal WebView wrapper. See `android/README.md`. It loads `dist-single/index.html` and supports over-the-air web-bundle updates.

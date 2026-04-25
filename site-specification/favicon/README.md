# High Torque Training — favicon set

## Files

| File | Purpose |
|---|---|
| `favicon.ico` | Legacy fallback (bundles 16/32/48 px). Put at site root. |
| `favicon.svg` | Modern scalable icon — used by Chrome, Firefox, Safari 16+. |
| `favicon-16.png`, `favicon-32.png`, `favicon-48.png` | PNG fallbacks (also inside the .ico). |
| `favicon-192.png`, `favicon-512.png` | PWA / Android home-screen. |
| `favicon-maskable-512.png` | Android adaptive icon (safe-zone padded). |
| `apple-touch-icon.png` | 180×180, iOS home screen. |
| `site.webmanifest` | PWA manifest. |

## Install

1. Drop every file in this folder into your **site's root directory** (same folder as `index.html`).
2. Add this block inside the `<head>` of your HTML:

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0E0F12">
```

3. Hard-refresh (Cmd/Ctrl + Shift + R). Browsers aggressively cache favicons — if the old one sticks, try an incognito window.

## Colors

- Ink (background): `#0E0F12`
- Orange (mark): `#F05A1A`

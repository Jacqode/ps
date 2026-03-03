# Plug & Pause

Et simpelt webbaseret værktøj til at minde medarbejdere om korte mikro-pauser i løbet af arbejdsdagen.

## Struktur

```
public/        ← HTML-sider (widget, indstillinger, dashboard, admin)
js/            ← JavaScript (widget, settings, reminder, dashboard)
css/           ← Fælles stylesheet (style.css)
api/           ← API-dokumentation (Cloudflare Worker)
extension/     ← Browser-extension (manifest, background, content)
```

## GitHub Pages

Siden er tilgængelig på: https://jacqode.github.io/ps/public/index.html

## Backend

API: `https://plugandpause-backend.jakobhelkjaer.workers.dev`

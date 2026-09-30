# Lumen Goods sales dashboard

A React implementation of `docs/design/Sales Dashboard v3.dc.html`, the Claude Design prototype in this repository. It uses the Nocturne design system with a light theme by default.

## Run

```sh
npm install   # npm 11 or later; npm 10 crashes on Vite 8's optional packages
npm run dev
npm test
npm run build
```

## Structure

- `docs/design/`: the Claude Design prototypes (`Sales Dashboard v3.dc.html` is the one this app implements), the Nocturne and Modernist design system bundles, and the uploaded reference image.
- `src/api/`: the mock API. `client.ts` holds one async function per future REST endpoint over an in-memory store seeded from `seed.ts`. `hooks.ts` wraps each function in a React Query hook. To use a real backend, replace the functions in `client.ts`.
- `src/domain/`: pure business rules (stock status, restock suggestions, aging, credit, formatting). Vitest covers them.
- `src/theme/`: light and dark themes, the six accent presets, and the custom accent picker. The picker keeps the chosen hue and uses Nocturne's lightness steps. The app saves the choice in `localStorage`.
- `src/pages/`, `src/dialogs/`, `src/components/`, `src/layout/`: screens, the Restock, Edit pricing and New promotion dialogs, shared controls and charts, and the app shell.
- `src/styles/`: `nocturne.css` is a copy of the design system. `themes.css` holds the accent ramps and light theme from the design. `app.css` holds all layout styles. The app uses no inline styles. Charts and bars draw their sizes as SVG attributes.

## Differences from the prototype

- The "Mockup options" panel, the phone frame and the Tweaks props are gone. Below 768px the app switches to the mobile layout with the bottom tab bar and the "More" screen.
- Order lines store the price at which each order was placed. The prototype read the live product price, which contradicted its own note that open orders keep their price.
- Data lives in memory and resets on reload. Only the theme and accent survive a reload.
- Buttons whose flows the design does not define do nothing: Export, New order, Add account, Add product, Transfer stock, Export aging, Save, Add warehouse and Invite. The app does not save the Company fields or the default credit limit on Settings.
- The date range switch on Reports appears, as in the design, but changes nothing there. On Overview it changes the KPI cards.

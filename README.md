# Tor Mor 60

An immigration-counter game built with Vite, React, TypeScript, Tailwind CSS v4, Framer Motion and Zustand.

## Scripts

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Structure

- `src/App.tsx` — screen router (Landing → Nickname → Rules → Game → End), driven by `screen` in `src/store/gameStore.ts`
- `src/data/game-rules.json` — game rules data
- `src/engine/` — traveller generation, requirements, scoring
- `src/screens/` — top-level screens
- `src/components/` — UI pieces
- `src/i18n/` — EN/TH text
- `public/sounds/` — sound effects

Tailwind v4 is configured CSS-first in `src/index.css` through the `@tailwindcss/vite` plugin.

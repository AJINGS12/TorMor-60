# CLAUDE.md — Tor Mor 60

## What this is
**Tor Mor 60 (ตม. 60)** is a browser game where the player is a Thai immigration officer.
Each traveller gives the player 60 seconds to check documents, ask questions, and stamp **APPROVED** or **DENIED**.
It's a booth game for Nitify's capstone D-Day. The audience is mostly Thai high school students, plus industry experts.

- One-day build: keep it simple and ship.
- Played on a booth laptop or tablet. No login, no backend, no database.
- Hosted on Vercel as a static site.

## Stack
- React + Vite + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Framer Motion for all animation
- Zustand for state
- Leaderboard saved in `localStorage`, with reads and writes wrapped in try/catch

## Commands
- `npm run dev`: local dev server
- `npm run build`: production build (must pass before any commit)
- `npm run test:engine`: engine sanity test (generates travellers and checks evaluation)

## Folder rules
- `src/data/game-rules.json` is the **single source of truth** for countries, rules, questions, flaws, deny reasons, scoring, and all UI text. **Never hardcode rules or strings in components.**
- `src/engine/` holds pure TypeScript only: no React, no side effects. Everything here must be testable.
- `src/store/` holds Zustand stores (game state, leaderboard).
- `src/screens/` has one file per screen: Landing → Nickname → Rules → Game → End.
- `src/components/` holds reusable UI pieces.
- `src/i18n/` has the language context and `t()` helper. Every user-facing string comes from the JSON `{ en, th }` objects.

## Game flow
1. **Landing:** title, tagline, EN/TH toggle, "Become an Immigration Officer" button
2. **Nickname:** max 16 characters
3. **Rules:** briefing and checklist
4. **Game:** 5 travellers, 60 seconds each, 3 strikes = fired
   - The traveller walks in with luggage. A tag above their head shows flag, nationality and persona.
   - The passport is always on the desk. Other documents appear only after asking the matching question.
   - Each question takes 2 seconds while the traveller answers (speech bubble).
   - The player stamps APPROVED or DENIED. On DENIED they pick from 4 deny reasons.
   - A stamp slam animation plays, then the case result card, plus a consequence headline on mistakes.
5. **End:** result stamp, score, rank, leaderboard, Nitify call to action, play again

## Core logic (see `requirementLogic` in the JSON)
- Always required: passport (valid 6+ months from today), TDAC (name must match the passport), return ticket
- Visa required if: the country isn't exempt (Nigeria), OR the purpose is study/work, OR a tourism stay is longer than 30 days
- Visa must match the purpose: study → ED, work → Non-B, tourism → TR
- Yellow fever certificate required if: the nationality is flagged (Nigeria) OR the traveller transited a yellow-fever country (Brazil, Kenya, Ethiopia)
- Each traveller has 0 or 1 flaw. APPROVE is correct only when there's no flaw.

## Design direction
- Fun, bold, game-like, not corporate. Think airport counter at night with neon accents.
- Big touch targets (tablet-friendly). Minimum button height 48px.
- The stamp is the hero moment: screen shake, ink splash, thunk sound.
- Readable at a glance from 1–2 m away at a booth.
- Thai text must render well: use a Thai-supporting font (e.g. Noto Sans Thai / Prompt).

## Content rules
- Traveller names are fictional. No real people, no real ID designs, no government logos.
- Spread flaws evenly across all countries. No nationality should be the "bad" one more often.
- Footer disclaimer (from JSON): rules are simplified for gameplay.

## Working style
- Small, focused changes. Run `npm run build` after each feature.
- Ask before adding a new dependency.
- Don't refactor unrelated code.
- Commit messages: short and imperative (e.g. "Add stamp animation").

## Build order
1. Engine + test script
2. Game screen (counter, traveller, documents, questions, timer, stamp)
3. Landing, Nickname, Rules, End screens
4. Leaderboard
5. Sound + polish
6. Deploy to Vercel

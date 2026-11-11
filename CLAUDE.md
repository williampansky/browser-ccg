# Browser CCG

Browser-based collectible card game: Next.js 12 + React 17 front end, with game logic in
[boardgame.io](https://boardgame.io) 0.49.

**Direction:** a Hearthstone-style game (minions that attack, hero health, alternating
turns, Guard/taunt, spells, weapons, class skills). The earlier zone/SNAP-style game was
removed on branch `hs-rebuild`; it is preserved at tag `snap-style-v0` and branch
`archive/snap-style`. The new engine is being rebuilt from scratch, using the author's
earlier `hsclone` repo as the rules reference. Read these first:

- `VISION.md` - goals and priorities
- `ROADMAP.md` - milestones and what's next
- `PREVIOUS-VERSIONS.md` - the four earlier repos, how `hsclone` plays, and what to reuse
- `CARD-AUDIT.md` - card/art/balance review (written against the old zone rules; see its note)

## Current state

- **There is no playable game on this branch yet.** `game/game.ts` is a stub and `/play` is a
  placeholder page.
- The site shell works: home, `collection`, `deckbuilder`, `cards`, `store`, `profile`, `news`,
  `faq`, `changelog`, plus `pages/api/` for cards/users. The card renderers (`Card`, `Minion`) work.
- Card data still describes the old game (zone-style fields such as `zonePowerAdjustment`,
  `mechanicsSide`). It will need new fields for the Hearthstone rules (attack/health on every
  card, class, keywords like Guard). That is an Airtable schema change.

## Commands

- `npm run dev` - dev server (use npm; `yarn` isn't installed here, though `yarn.lock` exists).
  If port 3000 is taken, Next silently uses 3001, so read the startup log for the URL.
- `npm test` - jest (ts-jest, jsdom). Run one file: `npm test -- path/to/file.test.ts`.
- `npx tsc --noEmit -p .` - type check.
- `npm run build` / `npm run lint` - Next build and lint.
- `npm run airtable` - re-pulls card/zone/mechanic data from Airtable into JSON. Needs
  `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` in a `.env*.local` file (none checked in).
  You don't need it to run the site; the JSON is committed.

## Layout

- `pages/` - Next routes. `pages/api/` serves cards/users.
- `game/` - boardgame.io game definition (currently a stub). `game/data/` is a copy of `data/`.
  **`data/` and `game/data/` are identical**, both written by `airtable.node.ts`. Edit via the
  script or change both.
- `components/game-components/` - `Card`, `Minion`, `Avatar` (the rest of the old board UI was
  removed). `components/site-components/` - non-game UI.
- `features/` - Redux Toolkit slices (store in `store.ts`). `hooks/`, `utils/`, `enums/`, `types/`.
- `app.config.ts` - site pages/nav config plus `gameConfig.numerics` (deck/hand sizes, energy).

## Things worth knowing

- **Card ids** look like `SET_CORE_010`. Card ids were reassigned between the old repos and
  this one, so match cards across repos by name, not id.
- **`utils/` is a one-function-per-file folder with a barrel** (`utils/index.ts`). Many helpers
  there still assume the old zone-style card shape.
- **`hsclone` is the reference, not a dependency.** It is a two-tab game (page with `3002` in
  the URL is player 1); see `PREVIOUS-VERSIONS.md` for how to run it.

## Conventions

- TypeScript, single quotes, Prettier-style formatting. Types live in `types/`, enums in
  `enums/`; both have an `index.ts` barrel.
- Tests sit in `__tests__/` folders next to the code.
- Utilities in `utils/` are one function per file, kebab-case file names.
- Write tests for new engine rules first, ported from `hsclone`'s unit tests where possible.
- Current checks: `npm test` passes (12 tests), `npm run build` passes, and `tsc` has 8 errors,
  all `as Card` casts in `utils/__tests__/get-card-power.test.ts`. Don't "fix" unrelated
  failures as a drive-by.

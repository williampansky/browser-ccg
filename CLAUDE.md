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
- `RULES.md` - the approved rules spec for the new engine (the contract for tests); `RULES-ANSWERS.md`
  holds the author's decisions
- `ENGINE-DESIGN.md` - how the new engine is structured (proposal)
- `PREVIOUS-VERSIONS.md` - the four earlier repos, how `hsclone` plays, and what to reuse
- `CARD-AUDIT.md` - card/art/balance review (written against the old zone rules; see its note)

## Current state

- **There is no playable game on this branch yet.** `game/game.ts` is a stub and `/play` is a
  placeholder page. The new engine is being built in `engine/` (see `ENGINE-DESIGN.md`); so far it
  has the card model and loader (`engine/cards/`), covered by tests.
- The site shell works: home, `collection`, `deckbuilder`, `cards`, `store`, `profile`, `news`,
  `faq`, `changelog`, plus `pages/api/` for cards/users. The card renderers (`Card`, `Minion`) work.
- `data/*.json` (read by the site) still describes the old zone game (fields such as
  `zonePowerAdjustment`, `mechanicsSide`). The Hearthstone-style data lives in a different Airtable
  base and is pulled into `data/hs/` (see "Two Airtable bases" below). The site has not been
  switched over to it yet (ROADMAP Milestone 4).

## Commands

- `npm run dev` - dev server (use npm; `yarn` isn't installed here, though `yarn.lock` exists).
  If port 3000 is taken, Next silently uses 3001, so read the startup log for the URL.
- `npm test` - jest (ts-jest, jsdom). Run one file: `npm test -- path/to/file.test.ts`.
- `npx tsc --noEmit -p .` - type check.
- `npm run build` - Next build. (`npm run lint` is not set up: there is no ESLint config, so it just
  prompts interactively. Don't run it.)
- `npm run airtable:hs` - pulls the Hearthstone-style card pool (CORE 132, PRIME 254, ENTOURAGE 43,
  9 heroes, abilities, mechanics, constants) into `data/hs/`. This is the data the rebuild uses.
- `npm run airtable` - the old zone-game pull into `data/` and `game/data/`. Only works against
  the `browser-ccg` base; on any other base it now reports the real Airtable error and writes nothing.
- Both need `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` in `./.env.local` (git-ignored, none checked in).
  You don't need either to run the site; the JSON is committed.

## Layout

- `pages/` - Next routes. `pages/api/` serves cards/users.
- `engine/` - the new Hearthstone-style rules engine (plain TypeScript, no React or boardgame.io
  in the core). `engine/cards/` loads `data/hs/` into normalised cards. Tests in `__tests__/`.
- `game/` - boardgame.io game definition (currently a stub). `game/data/` is a copy of `data/`.
  **`data/` and `game/data/` are identical**, both written by `airtable.node.ts`. Edit via the
  script or change both. `data/hs/` is separate: written only by `airtable.hs.node.ts`.
- `components/game-components/` - `Card`, `Minion`, `Avatar` (the rest of the old board UI was
  removed). `components/site-components/` - non-game UI.
- `features/` - Redux Toolkit slices (store in `store.ts`). `hooks/`, `utils/`, `enums/`, `types/`.
- `app.config.ts` - site pages/nav config plus `gameConfig.numerics` (deck/hand sizes, energy).

## Two Airtable bases

The same token can read both. Which one `AIRTABLE_BASE_ID` points at decides which script works.

- **`react-ccg`** (`REDACTED`) - the hsclone-era Hearthstone-style data. Used by
  `npm run airtable:hs`. Tables: CONSTANTS, MECHANICS, HEROS, ABILITIES, GAME, CORE, PRIME,
  ENTOURAGE. Card tables already have attack, health, cost, cardClass, mechanics, playType.
- **`browser-ccg`** (`REDACTED`) - the zone-game data behind `npm run airtable`.
- The `inspiration` column exists in the `react-ccg` base. It names the specific Hearthstone
  card(s) that inspired each entry. `airtable:hs` drops it on purpose because this repo is public.
  Don't add it back, and don't copy it in from the old repos' JSON (see `PREVIOUS-VERSIONS.md`).

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

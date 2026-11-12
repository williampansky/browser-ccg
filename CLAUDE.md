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

- **There is a playable hot-seat board at `/play`** (`components/play-board/`): one browser tab, both
  players, the active player at the bottom. It runs on the new engine with the real CORE cards the
  engine fully supports (`playablePool` in `engine/decks.ts`: now all 132). It defaults to playing against a greedy AI (`engine/bots/greedy-bot.ts`: tries each legal move, scores the result, one move ahead; Player 2); the menu switches it to the random bot (`random-bot.ts`) or to hot-seat. There is no art yet and no multiplayer. "Choose one" cards show option buttons before aiming (not yet
  clicked through in a browser, only covered by engine tests). `game/game.ts` is still a stub (the
  boardgame.io adapter comes later). The new engine is being built in `engine/` (see `ENGINE-DESIGN.md`). Slices 1-6 of
  its build order are done and tested: card model and loader (`engine/cards/`), state and turn flow,
  minions and combat, spells and `legalTargets`, keywords, triggers/warcries/`legalActions`, and
  weapons/armor/items. After the slices, every CORE card got a definition (Batches A-C: simple effects,
  small new effects, then spell damage, auras, this-turn boosts, a pre-attack hook and a played-cards
  history); the rule readings I had to choose are in `RULES.md` Appendix B. Still to build: the dedicated random-bot invariant suite (slice 7; a first
  version already runs in `legal-actions.test.ts`).
- The site shell works: home, `collection`, `deckbuilder`, `cards`, `store`, `profile`, `news`,
  `faq`, `changelog`, plus `pages/api/` for cards/users. The card renderers (`Card`, `Minion`) work.
- `data/*.json` (read by the site) still describes the old zone game (fields such as
  `zonePowerAdjustment`, `mechanicsSide`). The Hearthstone-style data lives in a different Airtable
  base and is pulled into `data/hs/` (see "Two Airtable bases" below). The site has not been
  switched over to it yet (ROADMAP Milestone 4).

## Next up (as of the last session)

The author was about to **playtest `/play`** (vs the random AI) and give feedback before deciding the
order below. Candidates, roughly in the order discussed:

1. **Playtest the full pool** and confirm or change the readings in `RULES.md` Appendix B. Decided: `CORE_007` only destroys the
   weapon (follow the text), and TacMedic (`CORE_057b`, a summoned token whose warcry could never fire) is now a plain
   2/4 Guard. **That TacMedic edit was made by hand in `data/hs/entourage.json`; the author must make the same change
   (mechanic Guard instead of Warcry, text) in Airtable, or the next `npm run airtable:hs` pull reverts it.**
2. **Port the card art** from `hsclone`'s `public/` dir (this repo lacks it) and use it on the board.
   Check provenance/licences. The board is text-only until then.
3. **Bot-vs-bot win-rate tables** (Milestone 3; the greedy bot is done). Tune `evaluate` in `greedy-bot.ts` against them.
4. Slice 7 of the engine plan (a dedicated random-bot invariant suite) is mostly covered already by
   `engine/__tests__/real-pool.test.ts` and `engine/bots/__tests__/`.

**CI is deliberately the very last roadmap item** ("Way later: CI"). Do not suggest or build it early.

## Playing `/play`: drag and drop, debug params

- **Drag and drop is the main way to act; click is the fallback.** Drag a hand card onto your board (it lands in the
  gap nearest the pointer), onto a legal target, or onto the play area (untargeted spells). Drag a ready minion or your
  hero onto an enemy to attack. Dragging just selects, so the highlights and arrow match click-to-select, and a drop
  runs the same code as a click. "Choose one" cards (including Surveying Drone) are not selected while dragged (that
  would open their dialog mid-drag): the drop remembers where you dropped, opens the dialog, and picking an option
  plays it there. Hover popups are hidden during a drag (`body.dragging`), and drags that aim at a target (attackers, and
  cards with a target) use an invisible drag image (the arrow shows the aim; a ghost would cover the target). Cards
  dropped on the board or play area keep their ghost. It uses native browser drag, so it does not work on touch screens.
- **Debug URL params** (read on every "New game" while they are in the URL): `?first=0|1` picks who goes first
  (0 = Player 1); `?p0=CORE_045,CORE_051` and `?p1=...` put those cards in that player's opening hand, in order.
  Handy for testing a specific card, e.g. `/play?first=0&p0=CORE_045`.

## Working style: browser checks

- **Always close Playwright when you are done with it** (`browser_close`), then say so in the reply, so the author is
  not left looking at an open browser window thinking work is still going on. Prefer the headless server
  (`playwright-headless`) for routine checks; use the headed one (`playwright`) only to show something live.

## Commands

- `npm run dev` - dev server (use npm; `yarn` isn't installed here, though `yarn.lock` exists).
  If port 3000 is taken, Next silently uses 3001, so read the startup log for the URL.
- `npm test` - jest (ts-jest, jsdom). Run one file: `npm test -- path/to/file.test.ts`.
- `npx tsc --noEmit -p .` - type check.
- `npm run build` - Next build. **Don't run it while `npm run dev` is running**: it overwrites `.next/`, and the dev
  server then 404s its own chunks until it is restarted (delete `.next` and restart). Stop the dev server first, or skip the build. (`npm run lint` is not set up: there is no ESLint config, so it just
  prompts interactively. Don't run it.)
- `npm run sim -- [gamesPerPair] [greedy|random]` - bot-vs-bot balance report: win-rate grid for the three starter decks
  (`engine/starter-decks.ts`) plus best/worst cards (`engine/sim/`). 100 games per pair takes about 15 seconds.
- `npm run tune -- [gamesPerDeck]` - plays tweaked greedy-bot weights against the defaults (same deck both sides). A first run
  (60 games per deck) found no variant clearly better than the defaults (all within noise, 44-51%), so the weights are not the bottleneck.
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
Find the base ids in Airtable (they are not recorded here; this repo is public).

- **`react-ccg`** - the hsclone-era Hearthstone-style data. Used by
  `npm run airtable:hs`. Tables: CONSTANTS, MECHANICS, HEROS, ABILITIES, GAME, CORE, PRIME,
  ENTOURAGE. Card tables already have attack, health, cost, cardClass, mechanics, playType.
- **`browser-ccg`** - the zone-game data behind `npm run airtable`.
- The `inspiration` column exists in the `react-ccg` base. It names the specific Hearthstone
  card(s) that inspired each entry. `airtable:hs` drops it on purpose because this repo is public.
  Don't add it back, and don't copy it in from the old repos' JSON (see `PREVIOUS-VERSIONS.md`).

## Things worth knowing

- **Card ids** look like `SET_CORE_010`. Card ids were reassigned between the old repos and
  this one, so match cards across repos by name, not id.
- **Card art lives in `public/images/sets/SET_<SET>/<num>-CARD.jpg`** and `/play` reads it by card id (`CORE_011` ->
  `SET_CORE/011-CARD.jpg`). For the Hearthstone-style cards it must match `hsclone`'s
  `public/assets/images/sets/CORE/CORE_011-CARD.jpg`. The files here that pre-dated the rebuild came from the old zone
  game, whose ids pointed at different art (Hypnotoad showed a cat in a boat); 63 `-CARD` files were replaced with
  `hsclone`'s on 2026-11-11, so now every CORE/GAME card with art is byte-identical to `hsclone`'s. The `-DECK` and
  `-MINION` images and the old site pages (`Sidebar`, `Card`) still use the old zone-game art and ids. `CORE_088` is
  "FPO" placeholder art. PRIME has art for only 2 of 254 cards.
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
- Current checks: `npm test` passes (engine tests plus the older `utils` ones), `npm run build` passes, and `tsc` has 11 errors
  (8 `as Card` casts in `utils/__tests__/get-card-power.test.ts`, 3 redeclared variables in `airtable.node.ts`). Don't "fix"
  unrelated failures as a drive-by.

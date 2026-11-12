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
- `data/*.json` is the Hearthstone-style card data (the old zone-game JSON was deleted from `data/` on 2026-11-12; it is
  at tag `snap-style-v0`). It is pulled from the new Airtable base (see "Airtable" below). `pages/api/cards` now serves the engine's cards from `data/` (it used to 500 on the deleted zone files), but the old site pages
  still expect the zone-game shape, and `utils/` reads
  `constants.json`/`mechanics.json` in the old shape, so they are stale until ROADMAP Milestone 4 switches them over.

## Next up (as of the last session)

The author is **playtesting `/play`** and gives feedback in `PLAYTEST_NOTES.md`; the order below is not settled. Candidates, roughly in the order discussed:

1. **Playtest the full pool** and confirm or change the readings in `RULES.md` Appendix B. Decided: `CORE_007` only destroys the
   weapon (follow the text), and `CORE_057b` (a summoned token whose warcry could never fire, formerly TacMedic) is now a plain
   2/4 Guard called Frontline Guardsman; the same change is in Airtable and pulled (2026-11-11).
2. **Card art provenance/licences** (the art itself is ported and on the board; the README carries a "not licensed
   for reuse" notice). Still to do: a card-by-card provenance table and replacing placeholder art (Milestone 4).
3. **Bot-vs-bot win-rate tables** (Milestone 3; the greedy bot is done). Tune `evaluate` in `greedy-bot.ts` against them.
4. Slice 7 of the engine plan (a dedicated random-bot invariant suite) is mostly covered already by
   `engine/__tests__/real-pool.test.ts` and `engine/bots/__tests__/`.

**CI is deliberately the very last roadmap item** ("Way later: CI"). Do not suggest or build it early.

## Deck rules and the deck builder

- **Deck rules** (`engine/deck-rules.ts`): at most `MAX_DECK_SIZE` = 30 cards, for every deck (hand-built, starter or random).
  `createGame` throws on a bigger deck and `buildDeck` clamps. Fewer than 30 is allowed (fatigue covers it). Copy limit
  (`maxCopies`): 2 of any card, 1 if its rarity is `MYTHIC`; the deck builder enforces it, `createGame` does not.
- **`/deckbuilder`** (`components/deck-builder/`) is the new builder on the engine's card model (the old page read the zone-game shape).
  Saved decks live in localStorage (`deck-storage.ts`).
- **PRIME is opt-in** (`primePool` in `engine/decks.ts`: active, named, non-token PRIME cards the engine can already play; 20 of 254 so far,
  the rest need definitions). The deck builder has a Core / Prime / Both filter; the picker has "Random deck (Core + Prime)"; every other
  random or starter deck stays CORE-only, so CORE's balance numbers are unchanged. Unnamed PRIME cards (51 in the data) are left out until Airtable names them.
  PRIME art exists for 2 of 254 cards, so most show a plain frame (404s for the missing images in the console are expected).
- **Starter decks** have an optional `minMinions`; Spellslinger (centred on 2.5 mana, 12 minions) and Armed (10) use it. After the 2026-11-12 tuning
  `npm run sim -- 30 greedy` shows every starter between about 35% and 65% overall.
- **Choosing decks for a game** (`components/play-board/deck-choice.ts`): Menu > "New game (choose decks)" opens a picker for each
  player: Surprise, Random starter deck, Random deck, one of the six starter decks (`engine/starter-decks.ts`), or a saved deck.
  The last picks are remembered (`ccg.newGame.v1`). **The AI seat never plays a saved deck**: it defaults to Surprise (a random
  starter deck, with a 1-in-10 chance of a fully random deck instead; `SURPRISE_RANDOM_ODDS`) and any saved pick becomes Surprise.

## Playing `/play`: drag and drop, debug params

- **Drag and drop is the main way to act; click is the fallback.** Drag a hand card onto your board (it lands in the
  gap nearest the pointer), onto a legal target, or onto the play area (untargeted spells). Drag a ready minion or your
  hero onto an enemy to attack. Untargeted spells and items cast from anywhere on the board above the player bar (the dashed
  `castArea` overlay; drop or click there). **Space** ends the turn; **Shift+Space** is "Attack hero" (only when that button is
  available). The weapon glows green when it can attack.
  **Accessibility mode** (one menu option, saved in localStorage; `accessibility.ts`) turns on the hover `title` tooltips (off by
  default, use `titleIf`), a keyboard focus outline and the explicit "Play" buttons; it is a start, not a full WCAG pass. Dragging just selects, so the highlights and arrow match click-to-select, and a drop
  runs the same code as a click. "Choose one" cards (including Surveying Drone) are not selected while dragged (that
  would open their dialog mid-drag): the drop remembers where you dropped, opens the dialog, and picking an option
  plays it there. Hover popups are hidden during a drag (`body.dragging`), and drags that aim at a target (attackers, and
  cards with a target) use an invisible drag image (the arrow shows the aim; a ghost would cover the target). Cards
  dropped on the board or play area keep their ghost. It uses native browser drag, so it does not work on touch screens.
- **Debug URL params** (read on every "New game" while they are in the URL): `?first=0|1` picks who goes first
  (0 = Player 1); `?p0=CORE_045,CORE_051` and `?p1=...` put those cards in that player's opening hand, in order.
  `?b0=CORE_027,CORE_061` and `?b1=...` put ready-to-attack minions on that player's board (no warcry or aura runs),
  `?w0=CORE_076` and `?w1=...` equip a weapon, `?e0=10` and `?e1=...` set that player's energy (current and total, 0-10). Handy for testing a specific card, e.g. `/play?first=0&p0=CORE_045`.

## Working style: browser checks

- **Always close Playwright when you are done with it** (`browser_close`), then say so in the reply, so the author is
  not left looking at an open browser window thinking work is still going on. Prefer the headless server
  (`playwright-headless`) for routine checks; use the headed one (`playwright`) only to show something live.

- **Never use port 3000 for Playwright checks.** Start your server with its own build folder, `NEXT_DIST_DIR=.next-test npm run dev -- -p 3100`:
  two dev servers sharing `.next` make each other reload endlessly (git-ignored; delete `.next-test` afterwards).
  Also: The author playtests on 3000 at the same time. Start your own dev
  server on another port (`npm run dev -- -p 3100`), point Playwright at that, and **when you are done close the
  browser and stop that dev server** (kill the process on the port), so nothing is left running.

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
- `npm run airtable` - pulls the card database from Airtable into `data/*.json` (`airtable.node.js`): CORE 132, PRIME 254,
  ENTOURAGE 43, GAME 1, 9 heroes, 18 abilities, mechanics, constants. This is the data the engine and `/play` use. It
  fetches every table first and writes nothing if any fails or comes back empty.
- The Airtable base was rebuilt on 2026-11-12: tables `CARDS` (all sets in one table; `set` column, `isEntourage` checkbox),
  `HEROES`, `ABILITIES`, `MECHANICS`, `CONSTANTS`; symbols are stored bare (`BULWARK`, `MINION`) and the pull puts the
  `%...%` back. `balance/airtable/` has the scripts that built and loaded it (`build.js`, `rebuild.js`; the Airtable API
  cannot delete tables or columns, so removals are done by hand in the UI). Balance proposals and the bot-evaluation patch
  are in `balance/` (see `balance/README.md`); `data/` already includes proposals 1-3 plus the trims in 4-5.
- It needs `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` in `./.env.local` (git-ignored, none checked in; read access is enough).
  You don't need either to run the site; the JSON is committed.

## Layout

- `pages/` - Next routes. `pages/api/` serves cards/users.
- `engine/` - the new Hearthstone-style rules engine (plain TypeScript, no React or boardgame.io
  in the core). `engine/cards/` loads `data/` into normalised cards. Tests in `__tests__/`.
- `game/` - boardgame.io game definition (currently a stub). `game/data/` is a stale copy of the old zone-game JSON;
  it no longer mirrors `data/`.
- `components/game-components/` - `Card`, `Minion`, `Avatar` (the rest of the old board UI was
  removed). `components/site-components/` - non-game UI.
- `features/` - Redux Toolkit slices (store in `store.ts`). `hooks/`, `utils/`, `enums/`, `types/`.
- `app.config.ts` - site pages/nav config plus `gameConfig.numerics` (deck/hand sizes, energy).

## Airtable and the `inspiration` column

- The current base has no `inspiration` column. The old `react-ccg` base (the hsclone-era data) has one naming the Hearthstone
  card(s) that inspired each entry; it is deliberately not carried over because this repo is public. Don't add it back, and don't
  copy it in from the old repos' JSON (see `PREVIOUS-VERSIONS.md`). Find base ids in Airtable (they are not recorded here).

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
- **Framed cards (`components/play-board/CardFace.tsx`)** port `hsclone`'s `CardV3`: the art sits behind a rarity frame PNG
  (`public/images/hs/frames/`) and the cost gem, name ribbon, text, type, rarity gem and sword/shield badges are laid
  over it in the frame's 178 x 250 design units, scaled by the `--u` CSS variable (so use `u(n)` in its SCSS, never `em`:
  an element's own font-size would change its offsets). Hand cards and the cast popup use it; board
  minions and the choose-one dialogs do not yet. **The hand's feel is ported from `hsclone`** (`components/play-board/hand-fan.ts`
  plus the `.handSlot` rules in `play-board.module.scss`): hsclone does it with plain CSS transitions, not react-spring (which
  it never used; `react-spring` in this repo's `package.json` is unused). Cards fan by index (`--fan-rot`, `--fan-drop`), overlap
  by `HAND_OVERLAP`, sink below the window edge (`--hand-sink`, set inline from the window height) and lift to 1.5x on hover
  (an in-place lift replaced the old hover popup). The `.hand` row has `pointer-events: none` so the lifted cards never block
  the hero bar. Dragging hides the source card and uses a centred clone as the drag image (the browser's own snapshot is of
  the hover-lifted card and lands far from the cursor).
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
- Current checks: `npm test` passes (472 tests; the card-number tests were updated to the balance pass on 2026-11-12), `npm run build` passes, and `tsc` has 8 errors
  (`as Card` casts in `utils/__tests__/get-card-power.test.ts`). Don't "fix"
  unrelated failures as a drive-by.

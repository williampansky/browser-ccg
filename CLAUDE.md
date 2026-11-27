# Browser CCG

Browser-based collectible card game: Next.js 12 + React 17 front end, a plain-TypeScript rules engine
(`engine/`) and a small custom Node + `ws` game server (`server/`). Live as an alpha at **bccg.io**
(see "Production" below).

**Direction:** a Hearthstone-style game (minions that attack, hero health, alternating
turns, Guard/taunt, spells, weapons, class skills). The earlier zone/SNAP-style game was
removed on branch `hs-rebuild` (now merged into `main`; use feature branches for large new work); it is preserved at tag `snap-style-v0` and branch
`archive/snap-style`. The new engine is being rebuilt from scratch, using the author's
earlier `hsclone` repo as the rules reference. Read these first:

- `VISION.md` - goals and priorities
- `ROADMAP.md` - milestones and what's next
- `RULES.md` - the approved rules spec for the new engine (the contract for tests); `RULES-ANSWERS.md`
  holds the author's decisions
- `ENGINE-DESIGN.md` - how the new engine is structured (proposal)
- `DESIGN-IDEAS.md` - running log of card, hero and mechanic ideas (public repo: never name the game an idea came from)
- `PREVIOUS-VERSIONS.md` - the four earlier repos, how `hsclone` plays, and what to reuse
- `CARD-AUDIT.md` - card/art/balance review (written against the old zone rules; see its note)

## Topic docs: read the one for the area you are about to change

Detail that only matters in one area lives in a `CLAUDE.md` next to that code. Claude Code loads a folder's file when
you read or edit something in it; if you start from somewhere else (a page, a script), read the file listed here first.

| Working on | Read |
|---|---|
| The `/play` board, spell effects (Pixi, `/spells-lab`), drag and drop, debug URL params, framed cards, the hand | `components/play-board/CLAUDE.md` |
| Any lab (`/board-lab`, hero, deck, minion, spells): adding controls, the scripts that bake a lab's URL | `components/board-lab/CLAUDE.md` |
| UI kit, themes, animated icons, `components/ui/` | `components/ui/CLAUDE.md` |
| Player name and colour theme | `components/player-profile/CLAUDE.md` |
| Decks, deck rules, PRIME opt-in, class-restricted cards, the deck builder and picker | `engine/CLAUDE.md` |
| Classes, hero skills, skill effects | `engine/heroes/CLAUDE.md` |
| Card art, art lab, `npm run art` / `asset`, where art files live | `scripts/art/CLAUDE.md` |
| Card data, `npm run airtable`, tokens, the Airtable base | `data/CLAUDE.md` |

## Current state

- **Online play (alpha):** `/play` is the lobby (`components/play-board/online/`: hero + deck pick, queue, "skip the queue: play a bot"), backed by the game server in `server/` (custom Node + `ws`, the engine's only copy of each game, redacted views, queue with a 30 s bot fallback of 90% greedy / 10% random, 60 s reconnect grace; `yarn server:dev` with `NEXT_PUBLIC_WS_URL=ws://localhost:3101/ws` for development, `render.yaml` for Render; see CHANGELOG 2026-11-26). The offline board below is at `/play/local`; the online board is `PlayBoard` with the `online` prop (seats flipped so you are always Player 1, `seat-flip.ts`).
- **There is a playable hot-seat board at `/play/local`** (`components/play-board/`): one browser tab, both
  players, the active player at the bottom. It runs on the new engine with the real CORE cards the
  engine fully supports (`playablePool` in `engine/decks.ts`: every CORE card). It defaults to playing against a greedy AI (`engine/bots/greedy-bot.ts`: tries each legal move, scores the result, one move ahead; Player 2); the menu switches it to the random bot (`random-bot.ts`) or to hot-seat. Online play is `/play`. "Choose one" cards show option buttons before aiming (not yet
  clicked through in a browser, only covered by engine tests). there is no boardgame.io adapter (the
  old `game/` stub was removed; online play uses the custom server instead). The new engine is being built in `engine/` (see `ENGINE-DESIGN.md`). Slices 1-6 of
  its build order are done and tested: card model and loader (`engine/cards/`), state and turn flow,
  minions and combat, spells and `legalTargets`, keywords, triggers/On Play effects/`legalActions`, and
  weapons/armor/items. After the slices, every CORE card got a definition (Batches A-C: simple effects,
  small new effects, then spell damage, auras, this-turn boosts, a pre-attack hook and a played-cards
  history); the rule readings I had to choose are in `RULES.md` Appendix B. Still to build: the dedicated random-bot invariant suite (slice 7; a first
  version already runs in `legal-actions.test.ts`).
- **Markdown pages:** Home renders `README.md`, News renders `ROADMAP.md` and Changelog renders `CHANGELOG.md` (`utils/render-markdown.ts` with `marked` in `getStaticProps`, shown by `MarkdownPage`; relative `.md` links point to GitHub). `/collection` is a browser of every playable card; `/deckbuilder` is separate. The bottom nav (`Footer`) has Home and highlights the current page. Keep `CHANGELOG.md` updated. The repo uses yarn: never leave a `package-lock.json`.
- The site shell works: home, `collection`, `deckbuilder`, `cards`, `store`, `profile`, `news`,
  `faq`, `changelog`, plus `pages/api/` for cards/users. The card renderers (`Card`, `Minion`) work.
- `data/*.json` is the Hearthstone-style card data (the old zone-game JSON was deleted from `data/` on 2026-11-12; it is
  at tag `snap-style-v0`). It is pulled from the new Airtable base (see "Airtable" below). `pages/api/cards` now serves the engine's cards from `data/` (it used to 500 on the deleted zone files), but the old site pages
  still expect the zone-game shape, and `utils/` reads
  `constants.json`/`mechanics.json` in the old shape, so they are stale until ROADMAP Milestone 4 switches them over.

## Production (bccg.io)

- **`main` is production.** `render.yaml` has `autoDeploy: true` on branch `main` (Render, one paid web service running
  Next and the game server together, `yarn start:prod`, health check `/healthz`). A push to `main` is a release, so do work
  on a feature branch and merge only when `npm test` and `npm run build` pass. Never push to `main` without being asked.
- The build is `yarn install --frozen-lockfile --production=false && yarn build && yarn server:build`: keep `yarn.lock` in
  step with `package.json` (never `package-lock.json`), and keep `server/` compiling under `tsconfig.server.json`.
- A deploy restarts the process, so every live game and the matchmaking queue are lost (state is in memory). Do not
  deploy casually while people may be playing.
- Bump the version for a deploy with `npm run semver:patch` (`:minor`, `:major`); `next.config.js` passes it to the build
  and `VersionLabel` shows it.
- `swcMinify: false` in `next.config.js` is deliberate (the SWC minifier broke spell effects in production; CHANGELOG
  2026-11-26). Look at a production build, not just dev, when you change effects code.
- `ALLOWED_ORIGINS` on the live server lists only the bccg.io hosts, so `localhost` pages cannot reach it; test online play
  against `yarn server:dev`.
- **CI is still the last roadmap item**; the checks above are run by hand before merging.

## Next up (as of the last session)

The author is **playtesting `/play`** and gives feedback in `PLAYTEST_NOTES.md`; the order below is not settled. Candidates, roughly in the order discussed:

1. **Playtest the full pool** and confirm or change the readings in `RULES.md` Appendix B. Decided: `CORE_007` only destroys the
   weapon (follow the text), and `CORE_057b` (a summoned token whose On Play effect could never fire, formerly TacMedic) is now a plain
   2/4 Guard called Frontline Guardsman; the same change is in Airtable and pulled (2026-11-11).
2. **Card art provenance/licences** (the author removed all FPO art on 2026-11-27: the art that remains is purchased or
   free-to-use, as are the sounds). Still to do: a card-by-card provenance table (Milestone 4).
3. **Bot-vs-bot win-rate tables** (Milestone 3; the greedy bot is done). Tune `evaluate` in `greedy-bot.ts` against them.
4. Slice 7 of the engine plan (a dedicated random-bot invariant suite) is mostly covered already by
   `engine/__tests__/real-pool.test.ts` and `engine/bots/__tests__/`.

**CI is deliberately the very last roadmap item** ("Way later: CI"). Do not suggest or build it early.

## Working style: browser checks

- **Always close Playwright when you are done with it** (`browser_close`), then say so in the reply, so the author is
  not left looking at an open browser window thinking work is still going on. Prefer the headless server
  (`playwright-headless`) for routine checks; use the headed one (`playwright`) only to show something live.

- **Never use port 3000 for Playwright checks.** Start your server with its own build folder, `NEXT_DIST_DIR=.next-test npm run dev -- -p 3100`:
  two dev servers sharing `.next` make each other reload endlessly (git-ignored; delete `.next-test` afterwards).
  Also: The author playtests on 3000 at the same time. Start your own dev
  server on another port (`npm run dev -- -p 3100`), point Playwright at that, and **when you are done close the
  browser and stop that dev server** (kill the process on the port), so nothing is left running.

## Working style: labs

- **Whenever asked to add controls to a lab or tool, read `components/board-lab/CLAUDE.md` first** and keep the new
  controls working with the lab's bake script (`npm run board`, `ring`, `deck`, `spell`), without being reminded.

## Working style: keep token costs down

- **Visual work (board art, textures, backgrounds, themes): ask for a reference or a clear description first**, then build ONE opt-in option (a URL param such as the board lab's `l...` knobs) for the author to look at in their own browser. Do not build several variants and screenshot each (three board-art prototypes were tried and thrown away on 2026-11-14).
- **Check with the cheapest tool that answers the question:** a unit test, a DOM query through `browser_run_code_unsafe` (read one element's text or rect), or a screenshot of one element. A full-page accessibility snapshot (`browser_snapshot`) dumps the whole board, log and deck list; avoid it, or pass `depth` / a `target`. Take a full screenshot only when the look itself is the question.
- **Read only the part of a big file you need** (`pages/board-lab.tsx` is 600 lines; `PlayBoard.tsx` is far larger): `git grep -n` first, then read a range.
- Balance sims (`npm run sim:heroes`, `npm run tune`) cost wall-clock time, not tokens: run them in the background and read only the summary.

## Commands

- `npm run dev` - dev server (`yarn` 1.x is installed globally; use `yarn add` / `yarn install` for dependencies, never npm, so `yarn.lock` stays the only lockfile).
  If port 3000 is taken, Next silently uses 3001, so read the startup log for the URL.
- `npm test` - jest (ts-jest, jsdom). Run one file: `npm test -- path/to/file.test.ts`.
- `npx tsc --noEmit -p .` - type check.
- `npm run build` - Next build. **Don't run it while `npm run dev` is running**: it overwrites `.next/`, and the dev
  server then 404s its own chunks until it is restarted (delete `.next` and restart). Stop the dev server first, or skip the build. (`npm run lint` is not set up: there is no ESLint config, so it just
  prompts interactively. Don't run it.)
- `npm run tune -- [gamesPerDeck]` - plays tweaked greedy-bot weights against the defaults (same deck both sides; `engine/sim/sim-decks.ts` makes twelve seeded random decks for the sims, and `classDeck` swaps a hero's class cards into one). A first run
  (60 games per deck) found no variant clearly better than the defaults (all within noise, 44-51%), so the weights are not the bottleneck.

## Airtable: never edit it unasked

- **NEVER edit Airtable (create, update or delete records, fields or tables) unless the author has said, in that
  conversation, to make that exact edit.** "Fill in", "fix" or "rename" a card means change the local code or `data/`
  unless the author says "in Airtable"; when it could mean either, ask first. Adding or renaming a token is an Airtable
  write too.
- A pull (`npm run airtable`) is read-only but spends the author's limited API quota: run one only when it is needed,
  never as a routine check, and batch reads. If a write is approved, check the current value first, write only what was
  asked, keep one-off scripts outside the repo, and say exactly which records changed.
- The `_CLAUDE_CODE` token pair is write-capable only for the art lab's Save button and for edits the author has just
  approved; the plain `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID` pair is read-only. You do not need either to run the site:
  the JSON in `data/` is committed. (On 2026-11-21 29 card names were written to Airtable unasked and had to be reverted
  by hand.) Details and the token naming rules are in `data/CLAUDE.md`.
- This repo is public: never add an `inspiration` column back, and never name the game a card or mechanic idea came from.

## Layout

- `pages/` - Next routes. `pages/api/` serves cards/users.
- `engine/` - the new Hearthstone-style rules engine (plain TypeScript, no React or boardgame.io
  in the core). `engine/cards/` loads `data/` into normalised cards. Tests in `__tests__/`.
- `components/game-components/` - `Card`, `Minion`, `Avatar` (the rest of the old board UI was
  removed). `components/site-components/` - non-game UI.
- `features/` - Redux Toolkit slices (store in `store.ts`). `hooks/`, `utils/`, `enums/`, `types/`.
- `app.config.ts` - site pages/nav config plus `gameConfig.numerics` (deck/hand sizes, energy).

## Things worth knowing

- **A closure inside a loop shares the loop's variable in this build** (Next 12's SWC, ES5 target): a `setTimeout(() => use(target))` in a `for (const target of ...)` sees the last `target` (seen in the spells lab, 2026-11-25). Run delayed work in a `forEach` / `map` callback (or a small function) so each call has its own variables.
- **Card ids** look like `SET_CORE_010`. Card ids were reassigned between the old repos and
  this one, so match cards across repos by name, not id.
- **`utils/` is a one-function-per-file folder with a barrel** (`utils/index.ts`). Many helpers
  there still assume the old zone-style card shape.
- **`hsclone` is the reference, not a dependency.** It is a two-tab game (page with `3002` in
  the URL is player 1); see `PREVIOUS-VERSIONS.md` for how to run it.

## Conventions

- TypeScript. Types live in `types/`, enums in `enums/`; both have an `index.ts` barrel.
- **Formatting is Prettier** (`.prettierrc`: 80 columns, single quotes, `trailingComma: all`, `arrowParens: always`). A
  PostToolUse hook in `.claude/settings.json` runs `prettier --write` on every ts/tsx/js/scss file Claude edits;
  `yarn format` / `yarn format:check` run it over the repo. `data/`, `public/`, `balance/` and all `*.json` are ignored (see
  `.prettierignore`). Prettier does not wrap comments, sort imports or props, or add blank lines, so the rules below are
  followed by hand.

### Code style (follow these by hand; Prettier does not enforce them)

1. **Destructure instead of re-declaring a property under a new name.** If the code reads `ctx.event`, write
   `const { event } = ctx`, not `const e = ctx.event`.
2. **Comments stay within 80 columns** (indentation included), and read like prose a person wrote. A one-line `/** ... */` is only for text that fits;
   a longer doc comment is a multi-line block: `/**`, then ` * ` lines, then ` */` on its own line. Use `/** */` for docs that
   should show in editor tooltips (exports, types, helpers other files use). A longer `//` comment wraps onto further `//` lines,
   which suits notes that do not need a tooltip, such as the header comment on a card definition. Do not use a trailing comment on
   a line that would pass 80 columns.
   **Wrap by reflowing the whole paragraph, never line by line.** Join the sentences, then break only where the next word would
   not fit, so every line but the last runs close to 80 columns. Do not keep an old manual line break, and do not wrap each old
   line on its own: that leaves short orphan lines ("how many copies the deck" / "that is only in the"). A break may stay only
   between paragraphs (a blank ` *` line) and before a list item or a deliberately separate note. When you edit a comment,
   reflow its whole paragraph, and never leave trailing spaces or a lone word on the last line if a small rewording avoids it.
   Example of the shape wanted:
   ```
   /**
    * One row per distinct card in a deck, like a third-party tracker: how many
    * copies the deck started with and how many are still in it. Sorted by cost,
    * then name. A card that is only in the deck now (shuffled in mid-game) counts
    * its current copies as its total.
    */
   ```
3. **Arrow functions:** if the body does not fit on one line within 80 columns, use a block body with an explicit
   `return` (callbacks such as `flatMap` included), not a wrapped expression. An arrow whose body fits on one line stays
   braceless (`(m) => m.attack >= 7`). A call whose arguments wrap (`.map(\n  (m) => ...\n)`) does not count as the arrow
   wrapping.
   **A function that returns a function (curried handlers, `(key) => (value) => ...`) is not an exception:** write the outer
   function with a block body and an explicit `return` of the inner one, never a chain of arrows. Prettier will happily keep
   the chain, so this one is easy to miss; check for `=>` followed directly by another `(...) =>` when you finish a file.
4. **No long inline conditions.** When a condition, filter or map callback spans several lines or chains more than two
   operations or comparisons, name the parts (a variable, or a small helper such as `isHiddenMinion`).
5. **Blank lines:** a multi-line statement (a function, an `if` or loop block, a wrapped call) has a blank line before and
   after it, except at the start or end of its block. Consecutive single-line declarations stay together with no blank
   lines.
6. **JSX props in `.tsx` are alphabetical,** with `key` and `ref` first. A `{...spread}` is a divider: sort the props
   between spreads, never move anything across one (a later prop overrides the spread).
7. **Imports,** in this order with a blank line between groups, alphabetical within each: external packages, then `../`,
   then `./`, then `.scss` and other side-effect imports. `import type` sorts with its group by module path. When you edit
   a file, fix its imports.
8. **Descriptive names:** `minion`, `target`, `player`, not `m`, `t`, `p`.
9. **`if` statements:** a short `if` stays on one line with no braces (`if (target.kind === 'hero') return false;`) when
   it fits, holds one simple statement and has no `else`. Anything else (an `else`, several statements, complex logic)
   uses braces over multiple lines, which makes it a multi-line statement under rule 5.
10. **No magic numbers:** a bare number in rule code gets a descriptive local or shared name, or comes from the card's
    data (`n.primary`), never a bare `2` or `7`.
11. **Comments say why,** and only when the code is not already self-explanatory.
12. **Booleans** are named `is...`, `has...` or `can...`.
13. **Types:** standard TypeScript practice. No `any`, `interface` for object shapes, `type` for unions, and explicit return
    types on exported functions.
14. **Tests are named by card id** (`CORE_135`), never by card name, because names are editable Airtable data.

Not done yet: existing code does not follow rules 6 and 7 (a prop sort and an import sort are separate sweeps).
- Tests sit in `__tests__/` folders next to the code.
- Utilities in `utils/` are one function per file, kebab-case file names.
- Write tests for new engine rules first, ported from `hsclone`'s unit tests where possible.
- Current checks: `npm test` passes (when a card-count test fails after you add or pull cards, update `gameConfig.cardCounts` in `app.config.ts`, the one place those numbers live), `npm run build` passes, and `tsc` is clean (the 8 old
  `as Card` errors in `utils/__tests__/get-card-power.test.ts` went when that stale test was removed). Don't "fix"
  unrelated failures as a drive-by.

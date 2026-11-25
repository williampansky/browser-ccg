# Roadmap

Goals and priorities live in [VISION.md](VISION.md). Reference material is in
[PREVIOUS-VERSIONS.md](PREVIOUS-VERSIONS.md) (the earlier repos, especially `hsclone`). Work happens
in evenings and weekends, so milestones are sized to be finishable in a session or two where
possible. Claude drives the implementation; the owner reviews.

Order matters: each milestone makes the next one cheaper or safer.

## Milestone 0: Reset (done on branch `hs-rebuild`)

- [x] Archive the zone/SNAP-style game (tag `snap-style-v0`, branch `archive/snap-style`)
- [x] Run `hsclone` and confirm it plays (two tabs; summoning, attacking and Guard verified)
- [x] Remove the zone engine, board UI, zone pages and engine-only helpers (303 files, ~14.5k lines)
- [x] Slim `app.config.ts`; rewrite `CLAUDE.md`, `README.md`, `VISION.md`
- [ ] Merge `hs-rebuild` into `main` once Milestone 2 plays (decide when)

## Milestone 1a: Rules spec (deep-dive, read-only)

Why first: `hsclone` is the rules reference, but it was only lightly surveyed, its own tests are
stale (38 of 101 fail) and it has known bugs. Porting from a shallow read would encode its
accidents as rules. This milestone produces an authoritative `RULES.md` before any engine code.

- [x] Read the `hsclone` rules code end to end: turn flow and draw, combat and targeting, card
      effects (spells, On Play effects, weapons, class skills, boons/buffs), keyword semantics
- [x] Analyse the card data (`data/`): field semantics, mechanics grammar, number fields,
      `%SYMBOL%` and text-token syntax, data-quality problems
- [x] Mechanics coverage matrix: what the card pool uses vs. what `hsclone` actually implemented
- [ ] Verify doubtful rules by driving `hsclone` live in two tabs (partly done; see `RULES.md` section 13)
- [x] Bug/quirk list of things deliberately **not** to copy
- [x] Open design questions for the author, answered before 1b starts (`RULES.md` section 12; three provisional items)

Done when: `RULES.md` is approved, every rule cites its source (`file:line` or a live test), and the
author has approved it and answered the open design questions.

## Milestone 1b: Engine foundation (headless)

Why: rules in plain tested TypeScript can be verified without any UI, and everything else sits on
them. Starts only after 1a is approved.

- [x] Pull the Hearthstone-style card data into `data/` (`npm run airtable`); the `react-ccg`
      base already has attack/health, class, mechanics and play type on every card table
- [x] Decide the new game-state shape (`G`) and a normalised in-engine card type, and note which
      raw fields (`%CONSTANT%` symbols, HTML text, number fields) the loader must clean up
- [x] Card model and loader (`engine/cards/`): normalises `data/` per RULES.md section 10, fails loudly
      on bad data, 31 tests (each verified by deliberately breaking the loader)
- [~] Port the core `hsclone` rules to TypeScript (slices 1-6 done; slice 7 is the bot invariant suite): turn order, energy (+1 per turn, cap 10), draw,
      play minion/spell/weapon, minion vs minion and minion vs hero attacks, damage and death,
      Guard (only Guards may be attacked), summoning sickness, win/loss at 0 hero health
- [~] Port `hsclone`'s unit tests as the starting suite (moves, state, spells, boons/buffs)
- [ ] Avoid `hsclone`'s known problems: the `killMinion` "disallowed move" client errors, an extra
      card drawn per turn, a tic-tac-toe leftover AI, stale test fixtures, and debug settings left on

Done when: a scripted two-player game plays from start to a winner inside a test.

## Milestone 2: Playable board

- [x] A `/play` board for the new engine: hero portraits and health, boards, hand, energy, deck
      counts, match log, End Turn (plus deck tracker, tooltips, spell-cast flash, card-type colours, sounds, menu)
- [x] Interaction as in `hsclone`: click a card to select, click a slot or target to play it; valid
      targets highlighted; attackers glow. Drag and drop is now the main way (hand to board/target/play area,
      minion or hero onto an enemy), with click kept as the fallback; arrows for both players
- [x] Hot-seat/two-tab play via boardgame.io `Local`, with no hard-coded hosts or ports
- [x] Card art on the board (hand, board, previews, overlays) via CSS backgrounds; the old `Card`/`Minion`
      renderers are not used by `/play`
- [x] Port the card art from `hsclone`'s `public/` dir: all 132 CORE cards and the entourage cards that have
      art are ported, plus the GAME cards. PRIME has art for only 2 of 254 cards anywhere. Still open: the
      provenance and licence check (Milestone 4), and `CORE_088` is "FPO" placeholder art

- [~] Card visuals from `hsclone`: the framed card (rarity frame PNG over the art, cost gem, name ribbon, stat badges)
      is done for cards in hand, the hover preview and the cast popup (`CardFace`). Still to do: the oval minions with
      sword/shield badges on the board, the choose-one/drone dialog cards, and the other `hsclone` visuals (board, hero art)
- [x] **Cards-in-hand feel, deep dive and port:** `hsclone`'s hand was tuned to feel like Hearthstone's (fan, hover lift,
      how a card follows the pointer, easing). Ported (fan, overlap, sink, hover lift, draw-in; it is plain CSS in hsclone,
      no react-spring). Still different from hsclone: the draw-in is a short 600ms fly-in, not its 3s keyframes

- [ ] **WCAG-friendly mode:** `/play` has one "Accessibility mode" toggle (hover tooltips, focus outline, Play buttons). Grow it into a
      real WCAG pass (contrast, keyboard play for every action, screen-reader labels) and split it into separate settings

Done when: you can play a full game against yourself in the browser, to a win.

## Milestone 3: Bot and balance tooling

- [x] A bot that only makes legal moves, so solo play works (start simple: random, then greedy).
      Random bot and greedy bot (`engine/bots/greedy-bot.ts`, one-move lookahead) done and wired into `/play`; the menu switches between them
- [x] Bot-vs-bot simulation: run N games per deck matchup and print win rates and per-card stats (`npm run sim`)
- [x] A few starter decks for the bot (Aggro, Midrange, Control; `engine/starter-decks.ts`)
- [x] Teach the greedy bot about Combo: it plays one move ahead, so it had no reason to play a cheap card first to switch a Combo card on. It now scores a move that turns Combo on by a `combo` weight per affordable Combo card in hand. Assassin went from 43% to 46% in the hero sim (within noise), so the bot was not the main cause; Crusader (61%) to Fighter (43%) is the bigger gap to look at.

Done when: one command prints a win-rate table for the starter decks.

## Milestone 4: The card set

Why here: card design and balance are the top priority, but they need working rules and a
simulator first.

- [ ] Choose the first-release pool from the current 69 cards, the old CORE 132 and the old PRIME 254
      (see `PREVIOUS-VERSIONS.md`); Bulwark/Guard, Armor and similar cards are core again
- [x] Switch the site pages from the deleted zone-game JSON to the new pool (`data/`)
- [ ] Naming and text pass (duplicate names, typos, "Attack" vs "Deal" wording; see `CARD-AUDIT.md`)
- [ ] Art match pass (mismatched art listed in `CARD-AUDIT.md` section 5)
- [ ] Art provenance table: card, artist, source, licence, status; replace temporary art
  - **Replacing the FPO art, class by class (started 2026-11-24).** The FPO art is the older
    art ported from `react-ccg-deprecated`, provenance unchecked. Done and FINAL (a-ravlik, art
    from the purchased packs): **Mystic, Warden, Necromancer, Ranger, Wizard, Cleric** (and Fighter bar `PRIME_242` Snap, which needs a snap-style image), plus ten PRIME spells, five
    minions, the Idol tokens and Hellspawn. Left (active cards): **85 cards and 14 tokens**
    with `artStatus` FPO: neutral 56, Crusader 14, Assassin 14, Fighter 1. Check the live count with the Art filter in `/collection`, or from `data/`.
  - **The loop that works:** `npm run asset -- <words>` finds an icon by meaning (spells, items,
    weapons); creatures are cutouts from `CARD CHARACTERS` in Downloads composited onto
    `CARD BACKGROUNDS` (Characters Pack 07 and the 10-creature packs; about 150 cutouts are
    still unused). Show three options per card on one board, pick, cut with `npm run art`
    (`--minion` for board minions), then, with explicit approval for those exact records, write
    `name`, `artistName`, `artistUrl` and `artStatus` to Airtable, pull, and commit. Check a
    creature against existing art before using it (template matching; a real match scored 14.6,
    unrelated art 25 or more). Where each creature and background went is in `ART-LICENSES.md`.
  - **Loose ends from these passes:** PRIME_218's name "Triton Sorcerery" looks like a typo;
    PRIME_221 (an Android) shows a stone gargoyle and PRIME_215 (a Sprite) a brain on stalks, so
    their names or art may want another look; the old name "Ancient Portal" is still in two test
    titles (`bodies.test.ts`, `cost.test.ts`) and in `balance/`; CORE_109 and PRIME_099a,
    100a, 107a, 108a, 109a to d, 112a, 112b, 157a, 189a, 248a to c and 169a are tokens or
    inactive cards with no art yet; "Hellfire Bolt", "Warboss" and other names were not checked
    against names from other games (the Treant name was caught by the author).

## Milestone 5: Keywords and mechanics

Add one at a time, each with tests: Rush, Double Attack, Bubble, Disable, Expiration, energy shield,
On Play effect and on-death effects, boons vs buffs, weapons, class skills/heroes. Order by what the first
card pool needs.

## Milestone 6: Multiplayer

- [ ] Real server (boardgame.io `Server`) with lobby and matchmaking
- [ ] Gate who may call which move; hide the opponent's hand and deck (`playerView`)
- [ ] Reconnects, auth, hosting (Heroku or similar)
- [ ] Use `ctx.random` for all randomness so games are reproducible

Reference: `hsclone` and `react-card-game` had a two-client SocketIO setup hard-coded to
localhost; `react-ccg-deprecated` had a single-process Heroku-style server and a lobby wired to a
sample game. See `PREVIOUS-VERSIONS.md`.

## Milestone 7: Stack upgrade

Next 12 / React 17 / boardgame.io 0.49 are from late 2022. Upgrade as its own milestone, after the
new engine plays, so it doesn't block the game. The engine is plain TypeScript and should move
across with little change; the UI is where the upgrade work will be.

## Ongoing

- Player experience: board readability, animation, feedback, a tutorial. Get outside people to play
  it once it plays.
- Card balance passes, informed by Milestone 3 data.

## Later

- Store, collection and visuals polish (secondary per `VISION.md`)
- Monetization (needs a decision first; see open questions in `VISION.md`)

## Way later: CI

Deliberately last. Only after the game plays, has been played by real people, and the card set is
settled: CI running `tsc`, `jest` and `next build`. Not before.

## Possible board enhancements (not scheduled)

Written down after comparing our board with Hearthstone's (2026-11-14). Its core board surface is plain; what makes it feel good is
the framing and how it responds. Roughly cheapest first:

- **Interactive feel, no new art:** idle motion and hover wiggles on minions, heroes and the energy bar (the "idle cursor tapping"
  idea: the board reacts when you poke at it or leave it alone). Mostly CSS.
- **Audio pass:** card pickup, hover, drop and play sounds; a hit sound that scales with damage; per-minion or per-keyword sounds
  (`sounds.ts` has the basics).
- **Effects:** distinct spell and skill effects (fire, lightning, heal) on top of `SpriteEffect` and the `/fx` sprites, instead of one generic effect.
- **A shaped play surface:** an elongated diamond with chamfered corners and a metal rim (CSS `clip-path` plus a border image), on a
  bright, opaque surface. The surface matters: a dark or translucent one made the minions look like they float (tried and dropped 2026-11-14).
- **Side bands** in the player colours (green for you, red for the opponent) behind each hero.
- **Corner props:** small whimsical machines, objects or furniture sitting on the board's corners, drawn from a slightly raised angle,
  never over the play area. Needs a matching art set; check owned packs before planning around it.
- **Hero frames:** arched portrait frames with a gem and health drop.

Tried and rejected: procedural noise textures (stone, felt, wood) and a blurred painted backdrop behind the board.

## Maintenance: bring old code up to the code-style rules (not scheduled)

Prettier and the comment wrapping are applied repo-wide (see `CHANGELOG.md`, 2026-11-22). The by-hand rules in
`CLAUDE.md` > Conventions > Code style are followed in new and edited code, but older code still breaks some of them.
Each of these can be a scripted pass in its own commit, checked by comparing every file's compiled output with
comments stripped (that proves no code changed), then listed in `.git-blame-ignore-revs`:

- [ ] Sort JSX props alphabetically in `.tsx` (rule 6; `key`/`ref` first, `{...spread}` as a divider).
- [ ] Sort imports (rule 7: packages, `../`, `./`, then `.scss`; blank line between groups).
- [ ] Braces on any `if` that does not fit on one line (rule 9). Prettier turns a long braceless `if` into a wrapped
      two-line one, which the rule does not allow.
- [ ] Comments the wrapping pass left: about 117 trailing comments after code, about 50 with tables, code or directives,
      and the `.scss` files (not swept at all).
- [ ] Not scriptable, so fix a file when you edit it: block-bodied arrows (rule 3), named conditions (4), blank lines
      around multi-line statements (5), descriptive names instead of `m`/`t`/`p` (8), magic numbers (10), boolean
      names (12), explicit return types on exports (13).

## Maintenance: split `PlayBoard.tsx` (not scheduled)

`components/play-board/PlayBoard.tsx` is about 1,700 lines (lines 1-338 are module-level code, 340-1703 is one component with about 35
`useState` calls and 30 effects sharing one set of closures). It is in roughly a quarter of recent commits, and every edit pays to find its
way around it. The board lab was split the same way on 2026-11-15 (`pages/board-lab.tsx` 627 -> 100 lines, pieces in `components/board-lab/`).

Expected payoff (a judgment, not a measurement): edits that land in an extracted piece get roughly 30-50% cheaper (a 100-200 line file
instead of hunting through 1,700) and fail less often (the main file has many near-duplicate lines); edits to the central state wiring
save little. The one-time cost is about 3-5 typical feature edits, spread over several commits, so it pays back after roughly 6-10 more edits.

Target layout (line counts are rough):

```
components/play-board/
  PlayBoard.tsx          ~250: shared state, wiring, page layout JSX
  model/    game-data.ts (byId, pools, Selection/Mode types, targetKey, sameTarget, targetOf), new-game.ts (debugParams, newGame, LabProps)
  tooltips/ useTip.tsx, MinionTip.tsx, LogCard.tsx, DeckRow.tsx, tip-text.ts
  hooks/    useSelection.ts, useDragAndDrop.ts, useAiTurn.ts, useHandLayout.ts
  parts/    Hand.tsx, BoardRows.tsx, HeroArea.tsx, SidePanels.tsx, MenuDialog.tsx, ChoiceDialog.tsx
```

`PlayBoard.tsx` keeps the game state and `dispatch`, runs the hooks and passes results to the parts; a small `BoardContext` (state, viewer,
selection, handlers) avoids long prop lists. `play-board.module.scss` stays one file at first.

Order, safest first, with tests and a browser check after each step: (1) `tooltips/` and `model/` (already outside the component, nearly
free); (2) the setup and debug code; (3) the drag-and-drop handlers and ghost state (the most-edited area lately); (4) hand rendering;
(5) the menu and pickers dialog; (6) the AI loop and sound effects. `useSelection` and `useDragAndDrop` are the riskiest (they share
selection, hover and drag state), so they go after the module-level pieces are out and tested. Do the same for `pages/minion-lab.tsx`
(also one big knob table plus UI) if it keeps being edited.

## Replace Airtable with a local card editor (not scheduled; estimate only)

Why: pulls spend API quota, every write needs approval, `data/*.json` is already
the real source of truth the game runs on, and card edits have no git history.
What it would cost: the grid, sorting and views, phone access and
collaboration. Sized by reading `airtable.node.js` (271 lines),
`scripts/art/airtable-card.ts`, `pages/api/art-lab/card.ts` and the loader
(`engine/cards/load-cards.ts`). The data is small: 137 CORE, 271 PRIME, 67
entourage and 1 GAME card, plus 9 classes, 18 heroes, 23 skills, 53 mechanics
and 24 constants. Estimates are for working with Claude (wall-clock, plus the
author's review time), not for a solo human.

What the pull transforms, which sets the migration scope: it wraps select values
as `%TYPE_MINION%`, `%RARITY_X%` and `%SET_002%`, turns the `cardClass` and
`SKILLS.class` links into class symbols (`0 %CLASS_FIGHTER%`), renames
`targetingText` to `targetingArrowText`, defaults `collectible` and `active` to
false, and splits one CARDS table into four files. The loader strips all of that
again (`stripSymbol`), and about 29 non-test files read `data/*.json` directly.

**Phase 1: make the JSON editable, keep its shape (about 1 session).**
Treat `data/*.json` as the source of truth as it stands; do not change the
`%SYMBOL%` shape yet. Re-point the art-lab card panel (`airtable-card.ts` and
`pages/api/art-lab/card.ts`) at the files: the same `FieldInfo` schema, but
choices come from the loader's known symbols and `mechanics.json` instead of
Airtable's meta API, and a save rewrites the one record (stable key order,
2-space indent, a trailing newline, same as the pull writes today).
`toUpdate` and its test carry over. Drop the "then pull" checkbox. Low risk: no
engine or loader change.

**Phase 2: new-card and other tables (about 1 session).**
A "new card" form that picks the next free id for a set and the
`PRIME_NNNa` token naming (see "Tokens" in `CLAUDE.md`), and editing for
skills, heroes, classes, mechanics and constants (the same field editor with a
different schema each). Integrity tests: every `entourage` id exists, every
class is one of `CLASS_KEYS`, ids are unique across files, art files exist (some
of this is in `art-files.test.ts`), and `gameConfig.cardCounts` matches.

**Phase 3: a grid (1 to 2 sessions, optional).**
Sort, filter and search the cards in a table with inline editing of simple
fields. This is the part that makes it feel like Airtable. Skip it if the
per-card editor is enough. The editor is dev-only and does not follow the UI
themes (labs are not themed), so a styled, batteries-included grid is fine.
Before choosing, check each package's React peer range: the site is on React 17
and Next 12, and several grids now need React 18 or later. Keep the grid behind
one `CardGrid` component so it can be swapped. Options (versions and licences
not yet verified; spike one for an hour against `data/core.json` first):
- **AG Grid Community** (MIT): first pick. Built-in cell editors, select
  dropdowns, column filters, sorting, resize, reorder, pinning, copy and paste
  and a quick text filter. Range selection and the fill handle are Enterprise
  (paid).
- **Glide Data Grid** (MIT): canvas, fast, the most spreadsheet-like feel. More
  work for filtering and sorting; React 17 support unchecked.
- **react-data-grid** (MIT): lightweight, editing and copy/paste built in;
  recent versions may need React 18, so an older release may be needed.
- **TanStack Table v8** (MIT): headless, works on React 17, but every editor
  and all the markup is ours to build. Only worth it if we want full control.
- Not recommended: MUI X DataGrid (pulls in all of MUI), Handsontable
  (non-commercial or paid licence), and NocoDB, Baserow or Teable (Airtable
  clones on SQL: no JSON diffs in git, which recreates two sources of truth).
- If no good grid supports React 17, run the editor as a small separate app
  under `tools/` with its own React version, or pin an older release.

**Phase 4: clean the schema (about 1 session, optional, the riskiest).**
Store bare symbols and real class keys (`"type": "MINION"`,
`"heroClass": "FIGHTER"`) and drop the `0 ` prefix and the legacy
`%CLASS_HERO_WARRIOR%` reading, `ENTOURAGE_ID_FIXES` and the old-key paths in
the loader. It touches the loader, its tests and the ~29 readers, so it comes
last and only if the `%SYMBOL%` shape bothers us. Phases 1 to 3 do not need it.

**Retire Airtable (under 1 hour).**
Remove `airtable.node.js`, the `airtable` script and `balance/airtable/`, the
`AIRTABLE_*` env notes, and rewrite the Airtable sections of `CLAUDE.md`
(including the "never edit Airtable unasked" rule: git becomes the undo). Take
one last pull first and keep the base as a read-only archive.

Total: about 3 sessions for a working editor with new-card support (phases 1 and
2 plus retirement), 4 to 6 with the grid and the schema clean-up. Biggest
unknowns: whether PRIME card edits depend on Airtable-only fields the pull drops
(none seen so far), and how much grid polish is wanted.

## Ideas / unscheduled

- Collectible heroes with different abilities (the old repos had 9 heroes) as a monetization angle
- Match history log as a player-facing feature (`hsclone` had one)

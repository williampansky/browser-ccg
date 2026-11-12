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
      effects (spells, warcries, weapons, class skills, boons/buffs), keyword semantics
- [x] Analyse the card data (`data/hs/`): field semantics, mechanics grammar, number fields,
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

- [x] Pull the Hearthstone-style card data into `data/hs/` (`npm run airtable:hs`); the `react-ccg`
      base already has attack/health, class, mechanics and play type on every card table
- [x] Decide the new game-state shape (`G`) and a normalised in-engine card type, and note which
      raw fields (`%CONSTANT%` symbols, HTML text, number fields) the loader must clean up
- [x] Card model and loader (`engine/cards/`): normalises `data/hs/` per RULES.md section 10, fails loudly
      on bad data, 31 tests (each verified by deliberately breaking the loader)
- [~] Port the core `hsclone` rules to TypeScript (slices 1-6 done; slice 7 is the bot invariant suite): turn order, energy (+1 per turn, cap 10), draw,
      play minion/spell/weapon, minion vs minion and minion vs hero attacks, damage and death,
      Guard (only Guards may be attacked), summoning sickness, win/loss at 0 hero health
- [ ] Port `hsclone`'s unit tests as the starting suite (moves, state, spells, boons/buffs)
- [ ] Avoid `hsclone`'s known problems: the `killMinion` "disallowed move" client errors, an extra
      card drawn per turn, a tic-tac-toe leftover AI, stale test fixtures, and debug settings left on

Done when: a scripted two-player game plays from start to a winner inside a test.

## Milestone 2: Playable board

- [x] A `/play` board for the new engine: hero portraits and health, boards, hand, energy, deck
      counts, match log, End Turn (plus deck tracker, tooltips, spell-cast flash, card-type colours, sounds, menu)
- [x] Interaction as in `hsclone`: click a card to select, click a slot or target to play it; valid
      targets highlighted; attackers glow. Drag and drop is now the main way (hand to board/target/play area,
      minion or hero onto an enemy), with click kept as the fallback; arrows for both players
- [ ] Hot-seat/two-tab play via boardgame.io `Local`, with no hard-coded hosts or ports
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

Done when: one command prints a win-rate table for the starter decks.

## Milestone 4: The card set

Why here: card design and balance are the top priority, but they need working rules and a
simulator first.

- [ ] Choose the first-release pool from the current 69 cards, the old CORE 132 and the old PRIME 254
      (see `PREVIOUS-VERSIONS.md`); Bulwark/Guard, Armor and similar cards are core again
- [ ] Switch the site pages from the old `data/` JSON to the new pool (`data/hs/`), and retire `game/data/`
- [ ] Naming and text pass (duplicate names, typos, "Attack" vs "Deal" wording; see `CARD-AUDIT.md`)
- [ ] Art match pass (mismatched art listed in `CARD-AUDIT.md` section 5)
- [ ] Art provenance table: card, artist, source, licence, status; replace temporary art

## Milestone 5: Keywords and mechanics

Add one at a time, each with tests: Rush, Double Attack, Bubble, Disable, Expiration, energy shield,
warcry and on-death effects, boons vs buffs, weapons, class skills/heroes. Order by what the first
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

## Ideas / unscheduled

- Collectible heroes with different abilities (the old repos had 9 heroes) as a monetization angle
- Match history log as a player-facing feature (`hsclone` had one)

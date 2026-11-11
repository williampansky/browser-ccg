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

## Milestone 1: Engine foundation (headless)

Why first: rules in plain tested TypeScript can be verified without any UI, and everything else
sits on them.

- [x] Pull the Hearthstone-style card data into `data/hs/` (`npm run airtable:hs`); the `react-ccg`
      base already has attack/health, class, mechanics and play type on every card table
- [ ] Decide the new game-state shape (`G`) and a normalised in-engine card type, and note which
      raw fields (`%CONSTANT%` symbols, HTML text, number fields) the loader must clean up
- [ ] Port the core `hsclone` rules to TypeScript: turn order, energy (+1 per turn, cap 10), draw,
      play minion/spell/weapon, minion vs minion and minion vs hero attacks, damage and death,
      Guard (only Guards may be attacked), summoning sickness, win/loss at 0 hero health
- [ ] Port `hsclone`'s unit tests as the starting suite (moves, state, spells, boons/buffs)
- [ ] Avoid `hsclone`'s known problems: the `killMinion` "disallowed move" client errors, an extra
      card drawn per turn, a tic-tac-toe leftover AI, stale test fixtures, and debug settings left on
- [ ] CI running `tsc`, `jest` and `next build`

Done when: a scripted two-player game plays from start to a winner inside a test, and CI is green.

## Milestone 2: Playable board

- [ ] A `/play` board for the new engine: hero portraits and health, boards, hand, energy, deck
      counts, match log, End Turn
- [ ] Interaction as in `hsclone`: click a card to select, click a slot or target to play it; valid
      targets highlighted; attackers glow
- [ ] Hot-seat/two-tab play via boardgame.io `Local`, with no hard-coded hosts or ports
- [ ] Reuse the existing card art and `Card`/`Minion` renderers

Done when: you can play a full game against yourself in the browser, to a win.

## Milestone 3: Bot and balance tooling

- [ ] A bot that only makes legal moves, so solo play works (start simple: random, then greedy)
- [ ] Bot-vs-bot simulation: run N games per deck matchup and print win rates and per-card stats
- [ ] A few starter decks for the bot

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

## Ideas / unscheduled

- Collectible heroes with different abilities (the old repos had 9 heroes) as a monetization angle
- Match history log as a player-facing feature (`hsclone` had one)

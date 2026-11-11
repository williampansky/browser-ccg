# Roadmap

Goals and priorities live in [VISION.md](VISION.md); current status and known issues are
in [README.md](README.md). Work happens in evenings and weekends, so milestones are sized
to be finishable in a session or two where possible. Claude drives the implementation; the
owner reviews.

Order matters: each milestone makes the next one cheaper or safer.

## Milestone 1: Fix the bot

Why first: it's the one diagnosed bug, and it unblocks balance work.

- [ ] Fix `game/ai-enumeration.ts`: enumerate only cards in hand with `currentCost <= AP`, in zones with an open slot
- [ ] Console no longer floods with `INVALID_MOVE(cantAffordCard)` after End Turn

Done when: a full game against the bot produces no `cantAffordCard` errors.

## Milestone 2: Safety net

Why: multiplayer will touch core game state, and dependency upgrades need tests to lean on.

- [ ] `jest` green (5 failing deck/hand count tests; check each expectation before changing it)
- [ ] `tsc` clean (15 errors, all in test files)
- [ ] CI running `tsc`, `jest` and `next build` on every push
- [ ] Clean up console warnings (`next/image` parents, react-spring `start`)
- [ ] Hide the debug header (`debugConfig.showDebugBar = false`) for user-facing builds

Done when: CI is green on `main`.

## Milestone 3: Balance tooling

Why: card balance is a top priority, and this turns it from gut feel into data.

- [ ] Self-play simulator: run N bot-vs-bot games per deck pairing, no UI
- [ ] Report win rate per deck, and per-card stats (played, win rate when played)
- [ ] Decide which bot to use for bulk runs (`MCTSBot` is slow and its skill biases results; a random or greedy bot may be better)
- [ ] Create more AI decks (gives the simulator more matchups, and players more opponents)

Done when: one command prints a win-rate table for all AI decks.

## Milestone 4: Multiplayer spike

Why: find out how much work multiplayer really is before committing to a design.

- [ ] Spike: two browser tabs playing each other via a local boardgame.io server
- [ ] Write down findings: what carried over, what broke, hidden-info handling (`stripSecrets`)
- [ ] Decide: accounts/auth, hosting (Heroku or similar), real-time vs. async turns
- [ ] Turn the decisions into a proper multiplayer plan (replace this milestone's checklist)

Done when: the spike works locally and the design decisions are written down.

## Ongoing

- Player experience: drag-and-drop feel, animation, a tutorial. Get one or two outside people to play it once there's something worth showing.
- Card design and balance passes, informed by Milestone 3 data.
- Smarter bot moveset (after Milestone 1).
- Weapons (enums already prepped).

## Later

- Review `npm outdated` and security advisories; upgrade Next 12 / React 17 / boardgame.io 0.49 (only after Milestone 2)
- Store, collection and visuals polish (secondary per `VISION.md`)
- Monetization (needs a decision first; see open questions in `VISION.md`)

## Ideas / unscheduled

-

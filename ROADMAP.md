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
- [ ] Fix `if (cardIndex)` in `aiPlayCardMove` (`game/ai/ai.moves.ts`): index `0` is falsy, so the bot's first-slot card never fires its ability
- [ ] Fix zone-full checks: human path uses `length > slots` (should be `>=`); bot path computes `zoneIsFull` inverted and has the check commented out
- [ ] Fix turn order (`game/state/turn-order.state.ts`): both ternary branches are `['0','1']`, so player 0 always goes first

Done when: a full game against the bot produces no `cantAffordCard` errors, the bot's index-0 cards fire their abilities, and zones can't exceed 6 cards.

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

## Milestone 3.5: Unify card play and card coverage

Why: the human and bot play paths are separate (`play-card.move.ts` vs `aiPlayCardMove`), and 21 cards have both `exec` and `execAi` versions. Every new card is written twice, and bugs like the index-0 one appear in only one path.

- [ ] Card coverage audit: which of the 69 cards actually work (see `CARD-AUDIT.md`)
- [ ] One play path shared by human and bot (only the target-choosing step differs)
- [ ] Decide what to do with the legacy Hearthstone-style cards (Bulwark x4, Armor, Spell Damage, Choose One; see `CARD-AUDIT.md`): cut or redesign as zone-style effects. Then delete the matching `@todo` stubs (Bulwark, Heal, SetValue, SpellDamage, Silence, Transform) and any unused `mechanics` toggles in `app.config.ts`
- [ ] One test per card, so coverage stays visible
- [ ] Move per-card rules out of scattered `case 'SET_CORE_…'` switches into each card's own file

Done when: every card in `setsCore.json` has a passing test and there is a single play path.

## Milestone 4: Multiplayer spike

Why: find out how much work multiplayer really is before committing to a design.

Prerequisites found in the code review:

- [ ] Gate `aiPlayCard` / `aiSetDone` so clients can't play or finish the opponent's turn (and stop hard-coding player `'1'`)
- [ ] Replace `Math.random()` in game logic with `ctx.random` (`getRandomNumberBetween`, used by the bot)
- [ ] Make `stripSecrets` actually hide the opponent's hand and deck (its filtering is currently commented out)

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

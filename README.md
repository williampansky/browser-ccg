## Status check (2026-11-10)

Smoke-tested `npm run dev` in a browser: the home page loads, Play opens `/play`, and a
full round works (drag a card onto a highlighted drop area, End Turn, zone reveals, AP,
draws, zone effects and warcries all behave). Last commit before this check was Jan 2023.

### Known issues

- **AI spams invalid moves.** After End Turn the console fills with ~180 errors per turn:
  `INVALID_MOVE(cantAffordCard)` followed by `invalid move: aiPlayCard`. The game still
  progresses. Cause: `game/ai-enumeration.ts` builds `cardPool` from the whole deck plus
  hand and doesn't filter by AP, so most enumerated moves are unaffordable.
  Fix: enumerate only cards in hand with `currentCost <= AP`, in zones with an open slot.
- **5 failing tests** (58 of 63 pass), all about deck/hand counts, in
  `game/state/__tests__/counts.state.test.ts` and
  `utils/__tests__/draw-card-from-players-deck.test.ts`. Probably stale expectations after
  deck/hand size changes; check each one before updating it.
- **15 `tsc` errors**, all in test files (`as Card` casts on partial objects, e.g.
  `utils/__tests__/get-card-power.test.ts`). Application code type-checks cleanly.
- **Console warnings:** three `next/image` warnings (`/images/zones/z*.jpg` need a
  `position: relative` parent) and a deprecated react-spring `start` call.
- **Debug header** (`addressBarSize`, `g.turn`, `ctx.phase`, ...) shows on `/play` because
  `gameConfig.debugConfig.showDebugBar` is `true` in `app.config.ts`. Flip it to `false`
  for anything user-facing.
- **Unverified:** the hand's drag slot showed a stuck `grabbing` cursor after a few failed
  drags. May be an artifact of automated mouse events; check with a real mouse.

### Suggested order

1. Fix the AI move enumeration (above).
2. Get `jest` and `tsc` green, then add CI for `tsc`, `jest` and `next build`.
3. Clean up the warnings and hide the debug header.
4. Check `npm outdated` / security advisories. Stack is Next 12, React 17,
   boardgame.io 0.49 (all late 2022); don't upgrade until step 2 gives a safety net.
5. Then the TODOs above (smarter AI, more AI decks, hosting) and weapons (recent commits
   prepped the enums for it).

### Notes

- Package manager here is `yarn.lock`, but `yarn` wasn't installed on the machine used for
  the check; `npm run dev` works. If port 3000 is taken, Next falls back to 3001.
- Playing a card: drag it onto the red-outlined drop area on your side of a zone. Dropping
  anywhere else returns the card to your hand.

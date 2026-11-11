# Roadmap

Draft based on the TODOs and status check in `README.md`. Reorder or trim as you see fit.

## Now: stabilize

- [ ] Fix AI move enumeration in `game/ai-enumeration.ts` (only cards in hand with `currentCost <= AP`, in zones with an open slot)
- [ ] Get `jest` green (5 failing deck/hand count tests)
- [ ] Get `tsc` clean (15 errors, all in test files)
- [ ] Add CI running `tsc`, `jest` and `next build`
- [ ] Clean up console warnings (`next/image` parents, react-spring `start`)
- [ ] Hide the debug header (`debugConfig.showDebugBar = false`) for user-facing builds

## Next: maintenance

- [ ] Review `npm outdated` and security advisories (Next 12, React 17, boardgame.io 0.49)
- [ ] Upgrade dependencies, once CI gives a safety net

## Later: gameplay

- [ ] Smarter AI moveset
- [ ] More AI decks
- [ ] Weapons (enums already prepped)

## Later: infrastructure

- [ ] Host the game server / AI on Heroku or similar

## Ideas / unscheduled

-

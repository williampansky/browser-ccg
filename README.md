# Browser CCG

A browser-only, turn-based collectible card game in the style of the original Hearthstone.
See [VISION.md](VISION.md) for goals and priorities and [ROADMAP.md](ROADMAP.md) for what's next.

## Status (2026-11-11)

The game is being **rebuilt**. An earlier zone/SNAP-style version is preserved at tag
`snap-style-v0` and branch `archive/snap-style`. On this branch the old rules engine and board UI
are removed, `/play` is a placeholder, and the card site (collection, deck builder, cards, store)
still works. The new Hearthstone-style engine is next, using the author's earlier `hsclone` repo
as the rules reference ([PREVIOUS-VERSIONS.md](PREVIOUS-VERSIONS.md)).

## Running

- `npm run dev` - dev server (see `CLAUDE.md` for the port note)
- `npm test`, `npx tsc --noEmit -p .`, `npm run build`
- `npm run airtable` - re-pull card data (needs `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`)

## Known issues

- No playable game yet (see Status).
- `tsc` reports 8 errors, all `as Card` casts on partial objects in
  `utils/__tests__/get-card-power.test.ts`.
- Card data and many `utils/` helpers still use the old zone-style card shape.
- Stack is Next 12, React 17, boardgame.io 0.49 (all late 2022); an upgrade is planned as its own
  milestone.

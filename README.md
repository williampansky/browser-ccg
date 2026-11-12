# Browser CCG

A browser-only, turn-based collectible card game in the style of the original Hearthstone.
See [VISION.md](VISION.md) for goals and priorities and [ROADMAP.md](ROADMAP.md) for what's next.

## Status (2026-11-11)

The game is being **rebuilt**. An earlier zone/SNAP-style version is preserved at tag
`snap-style-v0` and branch `archive/snap-style`. On this branch the old rules engine and board UI
are removed, `/play` is a placeholder, and the card site (collection, deck builder, cards, store)
still works. The new Hearthstone-style engine is next, using the author's earlier `hsclone` repo
as the rules reference ([PREVIOUS-VERSIONS.md](PREVIOUS-VERSIONS.md)).

## Card art and licensing notice

The card art in `public/images/` is **placeholder art used for prototyping. It is not licensed for reuse**, and it is
not covered by whatever licence the code in this repository may have. Please don't copy, redistribute or reuse the
images.

- Each card record in `data/hs/` credits its artist in `artistName` and `artistUrl`. Much of it is purchased marketplace
  art (for example [Rexard on GraphicRiver](https://graphicriver.net/user/rexard)); some is borrowed from independent
  artists on ArtStation and DeviantArt purely as a stand-in, and a few images are stock "FPO" (for placement only) comps.
  Some cards have no source recorded yet.
- A credit is attribution, not a licence. Marketplace licences typically allow use inside a finished product but not
  republishing the raw files, so the art here is meant to be **replaced with properly licensed or commissioned art before
  any public release**. A card-by-card provenance table is on the [roadmap](ROADMAP.md) (Milestone 4).
- If you are an artist or rights holder and want something here credited differently or removed, please open an issue
  on this repository and it will be taken down promptly.

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

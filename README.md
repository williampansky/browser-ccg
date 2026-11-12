# Browser CCG

A browser-only, turn-based collectible card game in the style of the original Hearthstone.
See [VISION.md](VISION.md) for goals and priorities and [ROADMAP.md](ROADMAP.md) for what's next.

## Status (2026-11-11)

A Hearthstone-style game is playable at **`/play`** (run `npm run dev`): minions that attack, hero health, alternating
turns, Guard, spells, weapons and armor, on a rules engine written from scratch in `engine/` (plain TypeScript, with
tests). You play against a bot (a greedy one-move-lookahead bot, or a random one) or hot-seat in one tab. Cards are
played by drag and drop, with click as a fallback. All 132 CORE cards are implemented. There is no multiplayer yet.

An earlier zone/SNAP-style version is preserved at tag `snap-style-v0` and branch `archive/snap-style`. The card site
(collection, deck builder, cards, store) still works but still describes that old game; switching it to the new card
data is on the roadmap. The rules reference is the author's earlier `hsclone` repo
([PREVIOUS-VERSIONS.md](PREVIOUS-VERSIONS.md), [RULES.md](RULES.md)).

## Card art and licensing notice

The card art and the card frames, badges and other UI art in `public/images/` are **placeholders used for prototyping.
They are not licensed for reuse**, and they are not covered by whatever licence the code in this repository may have.
Please don't copy, redistribute or reuse the images.

- Each card record in `data/` credits its artist in `artistName` and `artistUrl`. Much of it is purchased marketplace
  art (for example [Rexard on GraphicRiver](https://graphicriver.net/user/rexard)); some is borrowed from independent
  artists on ArtStation and DeviantArt purely as a stand-in, and a few images are stock "FPO" (for placement only) comps.
  Some cards have no source recorded yet.
- The frames, stat badges and gems (`public/images/frames/<COLOR>.png`, `public/images/ui/gem-<COLOR>.png`) come from third-party UI packs, also used here as stand-ins.
- A credit is attribution, not a licence. Marketplace licences typically allow use inside a finished product but not
  republishing the raw files, so the art here is meant to be **replaced with properly licensed or commissioned art before
  any public release**. A card-by-card provenance table is on the [roadmap](ROADMAP.md) (Milestone 4).
- If you are an artist or rights holder and want something here credited differently or removed, please open an issue
  on this repository and it will be taken down promptly.

## Running

- `npm run dev` - dev server (see `CLAUDE.md` for the port note), then open `/play`
- `npm test`, `npx tsc --noEmit -p .`, `npm run build`
- `npm run sim -- [gamesPerPair] [greedy|random]` - bot-vs-bot win-rate report for the starter decks
- `npm run airtable` - re-pull the card data into `data/` (needs `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`)
- `/play` also takes debug URL params, e.g. `/play?first=0&p0=CORE_045` (see `CLAUDE.md`)

## Known issues

- No multiplayer, accounts or server yet (`game/game.ts` is a stub; see [ROADMAP.md](ROADMAP.md)).
- `tsc` reports 8 errors: all are `as Card` casts on partial objects in `utils/__tests__/get-card-power.test.ts`. `npm test` and `npm run build` pass.
- The card site pages and many `utils/` helpers still use the old zone-style card data and shape.
- Card art is placeholder only (see the notice above); PRIME cards mostly have no art yet.
- Stack is Next 12, React 17, boardgame.io 0.49 (all late 2022); an upgrade is planned as its own
  milestone.

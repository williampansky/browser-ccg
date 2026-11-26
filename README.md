# Browser CCG

A browser-only, turn-based collectible card game in the style of the original Hearthstone.
See [VISION.md](VISION.md) for goals and priorities and [ROADMAP.md](ROADMAP.md) for what's next.

## Status (2026-11-26)

A Hearthstone-style game is playable at **`/play`**: minions that attack, hero health, alternating turns, Guard,
spells, weapons and armor, class heroes with skills, on a rules engine written from scratch in `engine/` (plain
TypeScript, with tests). Cards are played by drag and drop, with click as a fallback. Every CORE card and most PRIME
cards are implemented.

**Online alpha:** `/play` is a lobby. Pick a hero and a deck (random, or one you saved in the deck builder), then queue
for another player. If nobody is found within 30 seconds you are given a bot (mostly the greedy one-move-lookahead bot,
sometimes the random one), or tick "Skip the queue" to play a bot straight away. The game runs on a server that holds the
only copy of the match, so the opponent's hand and deck are never sent to your browser. There are no accounts: your
name, colour and decks live in this browser's localStorage. The offline board (a bot or hot-seat in one tab, no server)
is at **`/play/local`**. If you enjoy it, there is a [Ko-fi](https://ko-fi.com/williampansky) page.

An earlier zone/SNAP-style version is preserved at tag `snap-style-v0` and branch `archive/snap-style`. The card site
(collection, deck builder, cards, store) still works but still describes that old game; switching it to the new card
data is on the roadmap. The rules reference is the author's earlier `hsclone` repo
([PREVIOUS-VERSIONS.md](PREVIOUS-VERSIONS.md), [RULES.md](RULES.md)).

## Sound credits

The card sounds in `public/sounds/cards/` (`card-place-*`, `card-slide-*`) are Kenney's Casino Audio (kenney.nl), released under CC0 and
found on OpenGameArt.org.

The shimmer that plays while a card is held (`magic-fireflies.m4a`) is "Magic Fireflies" by ienba (freesound.org, sound 875330), CC0, converted to AAC. `magic-glow.m4a` is "Magic Glow" by ienba (freesound.org, sound 752274), also CC0 and also converted to AAC, an alternative for the held-card sound.

## Card art and licensing notice

The card art and the card frames, badges and other UI art in `public/images/` are **placeholders used for prototyping.
They are not licensed for reuse**, and they are not covered by whatever licence the code in this repository may have.
Please don't copy, redistribute or reuse the images.

- Each card record in `data/` credits its artist in `artistName` and `artistUrl`. Much of it is purchased marketplace
  art (for example [Rexard on GraphicRiver](https://graphicriver.net/user/rexard)); some is borrowed from independent
  artists on ArtStation and DeviantArt purely as a stand-in, and some cards have no source recorded yet.
- The frames, stat badges and gems (`public/images/frames/<COLOR>.png`, `public/images/ui/gem-<COLOR>.png`) come from third-party UI packs, also used here as stand-ins.
- A credit is attribution, not a licence. Marketplace licences typically allow use inside a finished product but not
  republishing the raw files, so the art here is meant to be **replaced with properly licensed or commissioned art before
  any public release**. A card-by-card provenance table is on the [roadmap](ROADMAP.md) (Milestone 4).
- If you are an artist or rights holder and want something here credited differently or removed, please open an issue
  on this repository and it will be taken down promptly.

## Running

- `npm run dev` - the site (see `CLAUDE.md` for the port note). `/play/local` works with this alone.
- To try online play locally, also run the game server: `npm run server:dev` (port 3001), and start the site with
  `NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws npm run dev`, then open `/play`.
- Production is one process serving both: `npm run build && npm run server:build && npm run start:prod`. `render.yaml`
  is the Render blueprint (a paid instance, because the queue and live games live in memory). Settings:
  `ALLOWED_ORIGINS` (sites allowed to open a socket), `QUEUE_WAIT_SECONDS` (default 30), `RECONNECT_GRACE_SECONDS`
  (default 60), `NEXT_PUBLIC_SUPPORT_URL` (overrides the Ko-fi link at build time).
- `npm test`, `npx tsc --noEmit -p .`, `npm run build`
- `npm run sim:heroes` and `npm run tune` - bot-vs-bot balance sims (see `CLAUDE.md`)
- `npm run airtable` - re-pull the card data into `data/` (needs `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`)
- `/play/local` also takes debug URL params, e.g. `/play/local?first=0&p0=CORE_045` (see `CLAUDE.md`)

## Known issues

- Online play is an alpha: no accounts, no rankings, and games live in server memory (a server restart ends them). Matches
  are not saved or replayable. See [ROADMAP.md](ROADMAP.md).
- `tsc` reports 8 errors: all are `as Card` casts on partial objects in `utils/__tests__/get-card-power.test.ts`. `npm test` and `npm run build` pass.
- The card site pages and many `utils/` helpers still use the old zone-style card data and shape.
- Card art is placeholder only (see the notice above); one PRIME card has no art yet.
- Stack is Next 12 and React 17 (late 2022); an upgrade is planned as its own milestone. Online play uses a small
  custom WebSocket server (`ws`), not boardgame.io.

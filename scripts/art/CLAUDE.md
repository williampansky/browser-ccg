# Card art pipeline (loaded when working in scripts/art, components/art-lab)

Moved out of the root `CLAUDE.md` so it only loads when this folder is in play.
The root `CLAUDE.md` still holds the rules that apply everywhere.

- `npm run art` - turns the master pictures in `art-inbox/` (git-ignored, Drive can sync it; named by card id, `CORE_117.png`) into `NNN-CARD.jpg` (1000 x 1000), `NNN-DECK.jpg` (600 x 75 strip) and, if the card already has one or with `--minion`, `NNN-MINION.jpg` (640 x 800) in `public/images/sets/SET_<SET>/` (`scripts/art/`; `sharp`). Where the strip and portrait are cut from is `art-focus.json` (`{ "CORE_117": { "x": 0.5, "y": 0.3, "zoom": 1.4 } }`, default centred a little high). Flags: a card id, `--dry`, `--keep`, `--minion`. Done masters move to `art-inbox/done/`.

- `npm run asset -- skull poison` - searches `art-assets-catalog.json`, a description of every one of the 1,091 purchased icons in `art-assets/` (git-ignored; the catalog is tracked, written by looking at each pack), and lists the files whose description has every word. Use it to match a card to art by meaning. Packs and file-name patterns are in the catalog (`prefix` + key + `suffix`); `scripts/art/asset-catalog.ts` is the search.

- `/art-lab` (dev only, localhost; `components/art-lab/`, `pages/api/art-lab/`, `scripts/art/`): look a card up by id or name from `data/`, then `/art-lab?id=CORE_122` shows the files on disk, a per-kind (card/deck/minion) crop adjuster over the master in `art-inbox/` ("Write images" cuts with `sharp`, then moves the master to `art-inbox/done/`), and every editable CARDS field (dropdown options come from the base's schema; `id`/`set`/`isEntourage` locked). "Save" PATCHes only the changed fields to Airtable and can then run `npm run airtable`. `sharp` is loaded with `eval('require')` in `scripts/art/render.ts` because Next's server bundle broke a normal import; keep `sharp` out of any module the card routes import.

- **Card art lives in `public/images/sets/SET_<SET>/<num>-CARD.jpg`** and `/play` reads it by card id (`CORE_011` ->
  `SET_CORE/011-CARD.jpg`). For the Hearthstone-style cards it must match `hsclone`'s
  `public/assets/images/sets/CORE/CORE_011-CARD.jpg`. The files here that pre-dated the rebuild came from the old zone
  game, whose ids pointed at different art (Hypnotoad showed a cat in a boat); 63 `-CARD` files were replaced with
  `hsclone`'s on 2026-11-11, so now every CORE/GAME card with art is byte-identical to `hsclone`'s. **`-DECK` strips (600 x 75, for the deck builder and the `/play` sidebar, not used by the UI yet)**: every CORE card has `hsclone`'s strip (copied 2026-11-12; CORE_019 and CORE_092 had none there, so theirs are cropped from the `-CARD` art). SET_CORE no longer has any `-MINION` images (the board draws minions from `-CARD`), nor old zone-game token art; `engine/cards/__tests__/art-files.test.ts` guards it. SET_PRIME's `-DECK` / `-MINION` images match its `-CARD` art. Only the old site pages (`Sidebar`, `Card`) still use the old zone-game ids. PRIME has `-CARD` art for every card but `PRIME_212`, copied from `react-ccg-deprecated`.

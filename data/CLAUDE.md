# Airtable and card data (loaded when working in data/)

Moved out of the root `CLAUDE.md` so it only loads when this folder is in play.
The root `CLAUDE.md` still holds the rules that apply everywhere.

- `npm run airtable` - pulls the card database from Airtable into `data/*.json` (`airtable.node.js`): the CORE, PRIME, ENTOURAGE and GAME cards,
  the heroes, classes, skills, mechanics and constants (the card counts the tests expect are in `gameConfig.cardCounts` in `app.config.ts`). Link columns (`SKILLS.class`, `CARDS.cardClass`) come back from Airtable as record ids, so the pull resolves them to class symbols through `CLASSES`. This is the data the engine and `/play` use. It
  fetches every table first and writes nothing if any fails or comes back empty.

- The `STARTER DECKS` table (one row per card: `class`, `card`, `copies`) is pulled into `data/starter-decks.json` and read by `engine/starter-decks.ts`; a pick need not have availability STARTER.

- The Airtable base was rebuilt on 2026-11-12: tables `CARDS` (all sets in one table; `set` column, `isEntourage` checkbox),
  `HEROES`, `CLASSES`, `SKILLS` (renamed from `ABILITIES` on 2026-11-23), `MECHANICS`, `CONSTANTS`; symbols are stored bare (`BULWARK`, `MINION`) and the pull puts the
  `%...%` back. `balance/airtable/` has the scripts that built and loaded it (`build.js`, `rebuild.js`; the Airtable API
  cannot delete tables or columns, so removals are done by hand in the UI). Balance proposals and the bot-evaluation patch
  are in `balance/` (see `balance/README.md`); `data/` already includes proposals 1-3 plus the trims in 4-5.

- **Tokens are entourage cards, named by who makes them.** Every token is an Airtable `CARDS` record with `isEntourage` ticked, rarity NONE, the class link of whatever makes it, cost 0, and a name (tokens are named, unlike cards). Two kinds:
  - **A class or skill token** (a hero skill's recruit, dagger, idol, claws: not tied to one card) is `GAME_XXX` (next free number), `set` GAME. Put the id in the skill's `entourage` column.
  - **A card's token** (made by one specific card) is that card's id plus a letter, `<SET>_<NUM>a`, then `b`, `c`, ... for more (`PRIME_131a`, `CORE_057b`), in the parent's set (`set` PRIME for a PRIME card). Put the id in the parent card's `entourage` column, or have its definition name it (`summonEntourage('PRIME_131a')`). Do not make a card's token `GAME_XXX`.
  Do not add tokens as local code tokens in `engine/heroes/tokens.ts`; the older ones there stay until they are moved. Like any Airtable write, adding or renaming one needs the author's explicit approval for that exact record.

- It needs `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` in `./.env.local` (git-ignored, none checked in; read access is enough for the pull). The art lab prefers `AIRTABLE_API_KEY_CLAUDE_CODE` / `AIRTABLE_BASE_ID_CLAUDE_CODE` (a token with `data.records:write`; it falls back to the plain pair, which cannot save). **NEVER edit Airtable (create, update or delete records, fields or tables) unless the author has said, in that conversation, to make that exact edit.** "Fill in", "fix" or "rename" a card means change the local code or `data/` unless the author says "in Airtable"; when it could mean either, ask first. A pull (`npm run airtable`) is read-only but spends the author's limited API quota, so run one only when it is needed, never as a routine check. Every call counts, so batch reads and do not re-run scripts to double-check. If a write is approved, check the current value first, write only what was asked, keep one-off scripts outside the repo, and say exactly which records changed. (On 2026-11-21 29 card names were written to Airtable without being asked and had to be reverted by hand.) The `_CLAUDE_CODE` token pair is write-capable only for the art lab's "Save" button and for edits the author has just approved; the plain `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID` pair is read-only. You don't need either to run the site; the JSON is committed.

## Airtable and the `inspiration` column

- The current base has no `inspiration` column. The old `react-ccg` base (the hsclone-era data) has one naming the Hearthstone
  card(s) that inspired each entry; it is deliberately not carried over because this repo is public. Don't add it back, and don't
  copy it in from the old repos' JSON (see `PREVIOUS-VERSIONS.md`). Find base ids in Airtable (they are not recorded here).

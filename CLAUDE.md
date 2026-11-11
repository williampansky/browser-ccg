# Browser CCG

Browser-based collectible card game: Next.js 12 + React 17 front end, with game logic in
[boardgame.io](https://boardgame.io) 0.49 (plus `bgio-effects` for animation events).
Single-player vs. a bot. See `README.md` for the current status and known issues.

## Commands

- `npm run dev` - dev server (use npm; `yarn` isn't installed here, though `yarn.lock` exists).
  If port 3000 is taken, Next silently uses 3001, so read the startup log for the URL.
- `npm test` - jest (ts-jest, jsdom). Run one file: `npm test -- path/to/file.test.ts`.
- `npx tsc --noEmit -p .` - type check.
- `npm run build` / `npm run lint` - Next build and lint.
- `npm run airtable` - re-pulls card/zone/mechanic data from Airtable into JSON. Needs
  `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` in a `.env*.local` file (none checked in).
  You don't need it to run the game; the JSON is committed.

## Layout

- `pages/` - Next routes. `/play` is the game; others: `collection`, `deckbuilder`, `store`,
  `cards`, `zones`, `profile`, `news`, `faq`, `changelog`. `pages/api/` serves cards/zones/users.
- `game/` - boardgame.io game definition. Start at `game/game.ts`.
  - `phases/` - one folder per phase (init-*, reveal-zone, increment-*, draw-card, play-card).
  - `moves/` - player moves (`play-card`, `select-card`, `deselect-card`, `attack-minion`, ...).
  - `state/` - slices of `G` and `defaultState`. The `G` type is `types/g.interface.ts`.
  - `mechanics/` - card/zone abilities. `core-mechanics-by-key/` is one file per card
    (`mechanic.core.NNN.ts`); `zones/` is one file per zone (`zone.NNN.ts`).
  - `ai/` + `ai-enumeration.ts` - bot moves and decks (bot is `MCTSBot`).
  - `debug/` - debug scenarios, toggled in `app.config.ts`.
  - `data/` - card/zone/mechanic JSON. **`data/` and `game/data/` are identical copies**,
    both written by `airtable.node.ts`. Edit via the script or change both.
- `components/game-components/` - board, hands (drag/drop in `Hands/PlayerHand.tsx`), zones,
  cards. `components/site-components/` - non-game UI.
- `features/` - Redux Toolkit slices (store in `store.ts`). `hooks/`, `utils/`, `enums/`, `types/`.
- `app.config.ts` - central game config: numerics (12 turns, 3 zones, 6 slots per zone,
  30-card decks, 10-card hands), mechanics toggles, AI toggles, and the debug switches.

## Things worth knowing

- **Card ids** look like `SET_CORE_010`. Mechanics are keyed by card, so a new card with a
  special ability needs its own `mechanic.core.NNN.ts`.
- **Debug switches** live in `gameConfig.debugConfig` in `app.config.ts` (force a hand card,
  board card, opponent cards, zones, or a scenario). `showDebugBar` is currently `true`, which
  is why the state header shows at the top of `/play`.
- **Playing a card is drag-and-drop**: drag from the hand onto the red-outlined drop area on
  *your* side of a zone. `PlayerHand.tsx` only plays the card if the element under the pointer
  has `data-receive`; any other drop calls `deselectCard`. Plain clicks on a hand card open the
  inspect modal.
- **The opponent is player `'1'`**, you are `'0'`. `stripSecrets` hides the opponent's hand/deck.
- **Known bug:** the AI floods the console with `INVALID_MOVE(cantAffordCard)` because
  `game/ai-enumeration.ts` doesn't filter by AP. Don't treat that console noise as a new
  regression. It's the first item in the README's known issues.

## Testing the UI

- A Playwright MCP server may be configured. Cards in the hand are covered by transparent
  `PlayerHandDragSlot` divs, so a plain click on the card text fails; use mouse down/move/up
  with several intermediate `steps` from the drag slot to the `[data-receive]` element.
- `data-index` on `[data-receive]` is the zone number (0-2).
- Screenshots land in `.playwright-mcp/` (gitignored).

## Conventions

- TypeScript, single quotes, Prettier-style formatting. Types live in `types/`, enums in
  `enums/`; both have an `index.ts` barrel.
- Tests sit in `__tests__/` folders next to the code (`game/state/__tests__`, `utils/__tests__`).
- Utilities in `utils/` are one function per file, kebab-case file names.
- Existing tests have 5 failures and `tsc` has 15 errors, all in test files. See the README.
  Don't "fix" unrelated failures as a drive-by; check what changed first.

# Engine design (PROPOSAL for approval)

How the new Hearthstone-style engine in `engine/` will be structured. It implements the approved
[RULES.md](RULES.md). Nothing past the card loader is built yet; this document is what I want
approved before writing the rules code. Section 11 lists the decisions I'd like you to confirm.

## 1. Goals (from RULES.md section 14)

Deterministic, headless, testable, and owned by the engine: death, winner, costs, board limit and
target legality are decided by the engine, never by the browser. One code path serves the UI, the
bot and the tests.

## 2. Layering

```
engine/            plain TypeScript. No React. No boardgame.io. No Math.random. No Date.
  cards/           card model + loader                         (built, tested)
  state/           GameState types, setup
  rules/           actions, validation, turn flow, combat, death, win
  effects/         typed effect primitives (damage, heal, draw, summon, ...)
  triggers/        event queue + trigger resolution
  definitions/     per-card behaviour (only for cards that need it)
game/              thin boardgame.io adapter (later): moves call engine.applyAction
```

The engine exposes a small pure API:

```ts
createGame(setup: { decks, firstPlayer }, catalog: Card[], rng: Rng): GameState
applyAction(state, action, rng): { state: GameState; events: GameEvent[] } | { error: ActionError }
legalActions(state, player): Action[]
legalTargets(state, source): TargetRef[]
```

`applyAction` never mutates its input. The boardgame.io adapter (Milestone 2/6) registers moves that
call it, passing `ctx.random` as the `Rng`. Reason for keeping boardgame.io out of the core: games can
be played, tested and simulated with no framework; bots call the same API; and a boardgame.io upgrade
(Milestone 7) cannot touch the rules.

## 3. State

Cards are referenced by id into a read-only catalog; state holds only what changes.

```ts
GameState {
  turn: number; activePlayer: PlayerId; status: 'playing' | 'over';
  winner: PlayerId | 'draw' | null;
  players: Record<PlayerId, PlayerState>;
  nextInstanceId: number;       // all instance ids come from this counter, never from uuid
}
PlayerState {
  health: number; armor: number; energy: { current: number; total: number };
  deck: CardInstance[]; hand: CardInstance[]; board: MinionInstance[];
  weapon: WeaponInstance | null; weaponAttacksThisTurn: number; fatigue: number;
}
MinionInstance {
  instanceId: number; cardId: string;
  attack: number; health: number; maxHealth: number;
  playedOnTurn: number; attacksThisTurn: number;
  keywords: { guard; rush; bubble; doubleAttack; hidden; noAttack };
  disabledUntilTurn?: number; expiresOnTurn?: number;
}
```

No hover, selection, animation or log-for-display state lives in `G` (hsclone mixed all of that in).
Everything in `GameState` is JSON-serialisable.

## 4. Actions and validation

`PlayCard { handIndex, boardIndex?, target? }`, `Attack { attackerId, target }`, `EndTurn`, `Concede`
(`UseHeroSkill` later). Validation returns a typed reason (`NOT_YOUR_TURN`, `CANT_AFFORD`,
`BOARD_FULL`, `ILLEGAL_TARGET`, `MINION_CANT_ATTACK`, ...) so the UI can explain a refusal and tests can
assert on it. Costs are always enforced (RULES Q4).

## 5. Effects: typed primitives, per-card definitions

Per RULES Q22 (investigated: the data alone covers under half of CORE), effects are small TypeScript
definitions built from shared primitives. The catalog supplies names, costs, stats and numbers; a
definition says what the card *does*:

```ts
// CORE_063 Fireballs: "Deal 1 damage to three random enemies"
defineCard('CORE_063', ({ n }) => ({
  onPlay: [damage(randomEnemies(n.random), n.primary)],
}));

// CORE_069 Magic Missile: targeted
defineCard('CORE_069', ({ n }) => ({
  target: enemyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary)],
}));
```

- **No definition needed** for vanilla and keyword-only cards (about 20 CORE cards): the catalog's
  stats and `mechanics` are enough.
- **Numbers are read through `n.primary / n.secondary / n.random`**, so what each field means lives in
  one place (RULES Q23 is provisional).
- **Spell power** is applied per effect kind from one config table (`damage: true, heal: false`), so
  RULES Q16 is a one-line change later. It never scales draws, armor or summons.
- Primitives: `damage, heal, draw, discard, summon, buff, setStat, destroy, disable, transform, steal,
  equipWeapon, gainEnergy, addArmor`. Each is a pure function over state that emits events.

## 6. Triggers and death resolution

Every effect emits events (`DamageDealt`, `MinionHealed`, `MinionSummoned`, `CardPlayed`,
`MinionDied`, `TurnEnded`, ...) onto a queue. Card definitions can subscribe (`on: { MinionHealed: ... }`),
which is what the three CORE cards with no hsclone code (071 Ice Primordial, 085 Ifriit Ward, 130 Sentry
Post) need, and what PRIME will need heavily (RULES Q21).

After every action the engine runs a settle loop: remove minions with health <= 0 **in play order**
(RULES Q15), emit `MinionDied`, run triggers, repeat until nothing changes, then check for game over
(RULES Q8). There is no timer and no client call involved.

## 7. Targeting

One function, `legalTargets(state, source)`, used by both the UI (to highlight) and `applyAction` (to
validate). `source` is a minion attacking, a weapon attack, or a card being played. Rules in one place:
Guard restricts attacks only (RULES Q10); hidden minions are untargetable by anything (Q19); card
definitions declare their own target filters (`enemyMinion()`, `damaged()`, `attackAtMost(3)`, ...).

## 8. Randomness and ids

The engine takes an `Rng` interface (`shuffle`, `int`, `pick`) and never calls `Math.random`. The
boardgame.io adapter wraps `ctx.random`; tests use a seeded generator, so every test game is
reproducible. Instance ids come from `nextInstanceId`.

## 9. Testing strategy

- Unit tests per primitive and per rule, written **before** the rule (RULES.md is the spec).
- Scenario tests: scripted games, including one that plays to a winner (the Milestone 1b exit test).
- **Invariant test:** two random bots play many seeded games; after every action assert energy >= 0,
  board <= 7, hand <= 10, health <= max, state serialises, and every game ends.
- A test per CORE card in Milestone 4, which is where the Appendix A text-vs-behaviour decisions get settled.
- Port hsclone tests only where they match RULES.md (38 of its 101 fail).

## 10. Build order (slices)

1. State, setup, turn flow, energy, draw, hand limit, fatigue, `EndTurn`, win by health.
2. Play minion, board and the 7 limit, summoning sickness, `Attack`, Guard, death settle loop.
3. Spells: `legalTargets`, damage/heal/draw primitives, targeted and global play.
4. Keywords: Bubble, Rush, double attack, hidden, no-attack, Disable, Expiration.
5. Triggers: warcries, events, `legalActions`.
6. Weapons and armor.
7. The random-bot invariant test.

Each slice is committed separately with its tests green.

## 11. Decisions I'd like you to confirm

1. **Engine independent of boardgame.io**, with a thin adapter later (section 2). The cost is that I
   write the (simple) turn loop myself instead of using boardgame.io's phases.
2. **Per-card TypeScript definitions over shared primitives**, not data-only and not hsclone-style switch
   files (section 5).
3. **Immutable updates with `immer`** (`produce`), which the repo already pulls in through boardgame.io,
   instead of hand-written cloning.
4. **File layout for definitions:** one file per non-trivial card under `engine/definitions/core/`
   (named like `core-063.ts`, matching the repo's existing per-card file convention), with vanilla and
   keyword-only cards having no file at all.
5. **Slice order** in section 10. In particular, that the random-bot invariant test comes last but runs
   in CI from the moment it exists.

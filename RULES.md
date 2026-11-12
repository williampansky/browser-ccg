# Rules spec (DRAFT for author approval)

Status: **approved 2026-11-11 (Milestone 1a), with provisos.** The author accepted the proposed
default for all 24 design questions (section 12). Three items are explicitly **provisional** and
will be revisited as the engine and card work reveal more (Q16, Q23, and "things not yet
remembered"). This is the contract for the new TypeScript engine (Milestone 1b) and its tests. It is a
living document: when a rule changes, change it here, with the date.

## 0. Summary: what the deep-dive found

1. **`hsclone` is a playable but unfinished reference.** Core play (energy, drawing, playing
   minions and spells, attacking, Guard, hero damage) works. A lot of its behaviour is accidental,
   and some of it is wrong.
2. **Its engine is hard-coded per card id; the live card data is richer.** `hsclone` reads an
   older JSON schema (`spellType`, `warcryNumber`, `spellContext`). The Airtable base we pulled into
   `data/` has since gained `playType`, `playContext`, `numberPrimary/Secondary/RNG`, and
   `mechanics` lists. So `hsclone` tells us **what each card does**, not what the data model is.
3. **The CORE set is a realistic first-release pool.** Of 132 CORE cards, `hsclone` has code for
   109, 8 are vanilla, 12 need only keywords, and just 3 have effects with no code. None of the
   254 PRIME cards has any code, and PRIME leans on mechanics `hsclone` never built (events,
   on-death, secrets, combo, overload).
4. **Several things the engine must own that `hsclone` left to the browser:** removing dead
   minions, detecting the winner, and enforcing the 7-minion board limit. Today a React effect or a
   client timer does the first two, and the UI alone enforces the third.
5. **Legality is scattered.** Whether a target is legal is decided in UI-oriented flags set by
   `select*` moves and trusted by the `attack*` moves. The rewrite needs one `legalTargets`
   function the engine itself enforces.
6. **About 19 CORE cards have text that disagrees with their implemented behaviour** (Appendix A
   lists them). Each needs an explicit decision.

## 0.1 How to read the evidence tags

| Tag | Meaning |
| --- | --- |
| **[V-code]** | I read the cited source myself and confirmed it |
| **[V-live]** | Observed in the running game (two browser tabs) |
| **[V-data]** | Confirmed by computing over `data/*.json` |
| **[A]** | Reported by a research agent, not independently re-checked |
| **[I]** | Inference |

Paths are relative to the `hsclone` repo (`src/lib/...`) unless noted. The agents' reports were
spot-checked, not re-derived: where I checked a claim it is tagged; one agent claim was wrong and is
corrected in section 10 (four prime "minions with no attack/health" actually have both).

---

## 1. Scope

- Two-player, turn-based, one shared board per side, hero with health, alternating turns.
- First release candidate pool: the 132 **CORE** cards (section 9). PRIME (254), ENTOURAGE tokens
  (43), 9 heroes and 18 hero abilities come later.
- Out of scope for v1 unless the author says otherwise: classes, hero skills, secrets (`%MYSTERY%`),
  turn timer.

## 2. Setup

| Rule | `hsclone` behaviour | Evidence |
| --- | --- | --- |
| Deck | 30 cards. Only a hard-coded debug "Sorcerer" deck is wired; the player-chosen deck path is a `@TODO`. Both players get the same deck and class | [A] `phases/initDecks.js:16-30` |
| Shuffle | boardgame.io `ctx.random.Shuffle` (deterministic) | [A] `initDecks.js:23-24` |
| Starting hand | First player draws 3. Second player draws 4 **and** gets "The Orb" (a +1 energy, this-turn-only spell), so 5 | [A] `phases/initHands.js:44-53` |
| Mulligan | Code exists, **off by default**, untested; has a bug (kept cards stay in the deck as duplicates) | [A] `initHands.js:32-122`, `game.config.js:15` |
| First player | Always player `'0'`. Random order is off by default, and when "on" it is computed once at module load with `Math.random` | [V-code] `config/game.config.js`, [A] `state.js:84-87` |

## 3. Turn structure

At the start of a player's turn, in this order (`phases/play.js:12-135`, [A]; the energy and debug
parts [V-code]):

1. Energy total +1 (cap 10) and refill (see 4.1).
2. Draw one card (see 4.2).
3. For each of the **current player's** minions: enable `canAttack` if attack >= 1 and not disabled;
   reset `currentAttack` to its total; tick the Disabled and Expiration countdowns.
4. Tick the same countdowns on the **opponent's** minions (so both boards tick every turn start).
5. Reset hero-skill usage; enable the hero attack if a weapon is equipped.
6. Clear UI selection state.
7. *(debug, remove)* push a `CORE_063` card into hand every turn while `enableDebugCard` is true.

At turn end: clear all minions' `canAttack` / target flags, clear hero attack flags and selections.

**Bug/quirk list for this phase:** the `canAttack` check at step 3 reads last turn's boosted attack
because the reset comes after it [V-code]; the two minion loops are copy-pasted and the
current-player loop kills `otherPlayer`'s minion at the same index [A]; the global `turns.js`
`onBegin` also increments energy (live test suggests it does not stack, but not rigorously) [V-live].

## 4. Resources

### 4.1 Energy
- Starts 0/0. Each turn: total +1, capped at 10, then current = total. Standard 1-to-10 model.
  [V-code] `turns.js`, [A] `state/energy.js`
- "The Orb": current +1 for this turn only, uncapped. `energy.subtract` then clamps `current` to
  `total`, so the extra energy can be lost on the next spend. [A] `spells/cast-the-orb.js`,
  `energy.js:85-92`
- No overload implemented, although PRIME has 10 `%OVERLOAD%` cards with `numberOvercharge`.
- **Costs are not enforced by default.** `debugData.enableCost` is `false`. Minion/spell/weapon plays
  only subtract energy when it is true, but targeted spells *always* subtract. [V-code]
  `game.config.js`, `cast-targeted-spell.js:52`

### 4.2 Drawing
- One card at turn start if hand <= 9. If the hand is full the top card is **burned** (moved to
  played cards). [V-code] `utils/draw-turn-start-card.js`
- Draws from effects into a full hand are **silently dropped** and the card stays in the deck. [A]
  `moves/draw-card.js:22`
- Empty deck: draw is a no-op. "Fatigue" exists but always deals 0 because the counter it reads is
  never negative. [V-code] `draw-turn-start-card.js:22-25`, [A] counts analysis
- **The observed 5 -> 7 hand jump is a debug card, not a double draw** (draw 1 + debug card). [V-code]
  `play.js:129-133`, `game.config.js:4`

### 4.3 Hand and board limits
- Hand max 10. [A] `draw-card.js:22`
- Board max 7 per side. Enforced **only in the UI** for normal minion plays; some spells and skills
  check `=== 7`. The engine's `playCard` has no capacity check. [A]
- The board is a dense array; a minion is inserted at the chosen index and the rest shift right.
  [A] `state/board-methods/place-card-on-board.js`

## 5. Winning

- Hero health starts at 30 and is clamped to [0, 30] (so healing cannot exceed 30). [A]
- `endIf` is `G.winner !== null`, but **nothing in the engine sets `winner`**. A React effect in
  `GameWrapper.jsx` calls the `setGameWinner` move when a hero reaches 0, and that move can be
  called by any client. [V-code] `GameWrapper.jsx:85-86`
- Both heroes at 0: the effect's second line wins, so the result is accidental. There is no draw.
  Forfeit subtracts 1000 health. The turn timer is dead code. [A]

---

## 6. Minions and combat

### 6.1 Minion state
~40 fields per board slot. The ones that carry rules: `currentAttack/totalAttack`,
`currentHealth/totalHealth`, `canAttack`, `hasGuard`, `hasEnergyShield` (this is **Bubble**),
`hasOnslaught/hasOnslaughtAttack` (a 2-attack toggle), `isConcealed` (stealth-like),
`isDisabled/isDisabledFor`, `willExpire/willExpireIn`, `isDead`. Many `can*` flags are transient
targeting state, not rules. `hasAttacked`, `isAttackingMinionPlayer`, `canReceiveGuard` are dead. [A]
`creators/create-board-slot-object.js:9-46`

### 6.2 Summoning sickness
- A new minion has `canAttack = false` and gets it at its owner's **next** turn start. [V-live] (a
  Wondrous Wisp played this way showed no attack glow), [A] `play.js:26-28`
- **Rush** sets `canAttack` immediately on play, with no attack >= 1 check. Behaviourally this is
  Charge-like (it can hit the hero), not "Rush: minions only". [A] `init-stampede.js`
- A hard-coded exception: CORE_062 lets played creatures attack at once. [A] `play-card.js:108-110`

### 6.3 Attack resolution
| Attack | Rule as implemented | Evidence |
| --- | --- | --- |
| Minion -> minion | Both take the other's attack **simultaneously**. A Bubble absorbs a hit (no damage). Then the attacker, then the defender, are checked for death | [V-live] two-way damage and a "was slain" log; [A] `attack-minion.js:11-112` |
| Minion -> hero | Blocked if any enemy minion has Guard (re-checked in the move). Armor (shield points) is removed first, overflow to health. No counter-damage | [V-code] `attack-player.js:30-32`, [V-live] 30 -> 27 |
| Hero/weapon -> minion | Hero takes the minion's attack as counter-damage **first**, then the minion takes the weapon's `playerAttackValue`. **The Guard check is commented out** | [V-code] `attack-minion-with-player.js:30-33` |
| Hero/weapon -> hero | Uses `weapon.attack` (not `playerAttackValue`). Guard enforced. No counter-damage | [A] `attack-player-with-player.js` |

- **Guard (`%BULWARK%`, "only these minions can be attacked").** Restricts minion attackers and the
  weapon->hero attack; **not** the weapon->minion move, and not spells, warcries or skills. [V-live]
  only Guards were highlighted as targets; [V-code] gaps above.
- A hero has one weapon attack per turn; each attack costs 1 durability; weapon is removed at 0.
  Weapon `attack` and `health` are attack and durability. [A]
- Armor (`playerShieldPoints`) absorbs only attack damage; spell and warcry damage hits health directly.
  [A/L]

### 6.4 Death
- Detection sets `isDead` when `currentHealth === 0` (`state/board-methods/kill-minion.js`). [V-code]
- **Removal is done by the browser.** `BoardSlot.jsx` waits 900 ms after `isDead` and calls the
  `killMinion` move. Both tabs render both boards, so both fire it, and the non-current player's call
  is rejected. This is the most likely source of the repeated `disallowed move: killMinion` console
  errors (observed 4 per death). [V-code] `BoardSlot.jsx:95-106`; the "non-active tab" part is
  [A], not live-verified.
- Dead minions stay on the board for 900 ms and still count as Guard/targets. [A]
- **On-death effects do not exist** (`%ON_DEATH%` is wired to an empty stub). [A]
- Both die in a trade: attacker marked first, then defender. [A]

### 6.5 Targeting
The UI contract, to be replaced by one engine query `legalTargets(attackerOrCard, G)`:
- Minion attacker: if the enemy has any Guard, only Guards; otherwise every non-concealed enemy minion
  plus the hero. [V-live], [A] `determinations.js:18-35`
- Spells/warcries/skills: per-card id logic in `select-card.js` (a switch), with ad hoc filters
  (attack <= 3, attack >= 5, damaged, undamaged). They ignore Guard; some exclude concealed. [A]
- The hero is a separate set of `playerCanBeAttackedBy*` flags. [A]

---

## 7. Keywords and mechanics

`mechanics.json` defines 49 symbols; the card pool uses ~40. The glossary gives the game's own display
names, which differ from the symbols in places: `%BULWARK%` is shown as **Guard**, `%RUSH%` as
**Stampede**, `%ON_PLAY%` as **Warcry**. This spec uses the symbol names (Rush, Guard) for consistency
with the data; card text shown to players uses the display names. Counts are CORE / PRIME / ENTOURAGE.
Role and status columns combine the data analysis [V-data for counts that I recomputed; A otherwise]
and `hsclone`'s code [A].

| Mechanic | Cards (C/P/E) | `hsclone` status | Note |
| --- | --- | --- | --- |
| BULWARK (Guard) | 14 / 22 / 3 | working | HS "taunt" |
| RUSH | 7 / 8 / 1 | working | behaves like Charge (6.2) |
| BUBBLE | 1 / 8 / 0 | working | stored as `hasEnergyShield`; attacks only |
| NO_ATTACK | 3 / 9 / 0 | label only | |
| DOUBLE_ATTACK | 2 / 7 / 0 | partial | "Onslaught" 2-attack toggle, set only by spells |
| HIDDEN / concealed | ~6 total | partial | `isConcealed`, set only by one token |
| DISABLE | 5 / 3 / 0 | working | countdown, see Q17 |
| EXPIRATION | 0 / 1 / 0 | partial | one spell; wrong-board kill bug |
| ARMOR | 2 / 3 / 0 | working | hero shield points |
| SPELL_DAMAGE | 4 / 2 / 0 | working | scales many non-damage effects, bug |
| ON_PLAY (warcry) | 24 / 45 / 1 | working for CORE only | |
| BOON | 8 / 8 / 0 | partial | temporary vs aura, two meanings |
| BUFF | 12 / 16 / 2 | partial | only spell-damage buffs are mechanic-driven |
| DESTROY, DRAW_CARD, SUMMON, HEAL, DAMAGE | many | working (bespoke) | per-card code |
| EVENT | 4 / 48 / 0 | **none** | CORE cards 071, 085, 130 need it |
| ON_DEATH | 0 / 18 / 0 | **none** | |
| ON_END | 0 / 6 / 0 | **none** | |
| COMBO | 0 / 7 / 0 | **none** | |
| MYSTERY (secret) | 0 / 20 / 0 | **none** | |
| OVERLOAD | 0 / 10 / 0 | **none** | |
| SILENCE, STEAL, TRANSFORM, IMMUNE, POISON, LIFESTEAL, DISCOVER, CANT_TARGET | 1-6 each | mostly none | STEAL, TRANSFORM, LIFESTEAL partial |

The data's implicit grammar is **(trigger)? + verb + qualifier\***: triggers (ON_PLAY, ON_DEATH,
ON_END, EVENT, COMBO), verbs (DAMAGE, HEAL, DRAW_CARD, SUMMON, BUFF, DESTROY...), qualifiers (TARGET,
AOE, RANDOM, SET_VALUE), plus standalone keywords. `%EVENT%` carries no event name; the actual event
("whenever you play a minion...") exists only in the card `text`. [A, inferred]

---

## 8. Card effects model

### 8.1 How `hsclone` dispatches (do not copy)
- **Hard-coded switches by card id**: `play-card.js` (by type), `spells/core.spells.js` (global
  spells), `moves/cast-targeted-spell.js` (targeted spells), `warcrys/core.warcrys.js`,
  `select-card.js` (legal targets). A whitelist in `play-spell-card-by-id.js` duplicates a switch. [A]
- Only keywords (Guard, Rush, Bubble, ON_PLAY) are data-driven, and only for CORE. PRIME has zero
  bespoke code. [V-code] 0 `PRIME_` ids appear in `lib/`.
- The numeric input was a single `warcryNumber`, wrapped as `|base + spellDamageBuff|`. That scaling
  applies to heals, shield, and draw counts as well. [A] `cast-targeted-spell.js:42-44`

### 8.2 Spells
- Types: `GLOBAL` (cast by dropping on the board) and `TARGETED` (two-step: `selectCard` then
  `castTargetedSpell`). Cost is paid, the card is moved to played cards, the effect runs, then all
  target flags are cleared. [A]
- Effects: damage, heal, destroy (implemented as **9000 damage**), disable, transform (replace the
  slot with a token), steal, draw, discard, stat buff/debuff/overwrite, sacrifice, expire. [A]
- Random effects use `Math.random` (not `ctx.random`) and `random.Die(n)` for discards, which returns
  1..n, not an index. [V-code] `core.spells.js:31-33`, `cast-targeted-spell.js:395-400`

### 8.3 Warcries (battlecry)
- The minion is placed on the board first, then its warcry runs; the warcry knows its own slot. [A]
- Immediate (no choice): CORE 007, 012, 013, 020, 025, 026, 032, 033, 035, 041, 082, 118, 122.
  Targeted (player picks): 001, 006, 016, 021, 036, 054, 059, 099, 110, 112 and others. [A]
- Several silently do nothing when no legal target exists, and 110's target list includes the caster.
  Warcry amounts do not use the spell-damage bonus. [A]

### 8.4 Weapons
- 5 CORE weapons (Recruit's Mace 1/4, Reckoning 4/2 "restore 2 HP before every attack", Gladius 3/4,
  Obsidian Axe 3/2, Vibroblade 5/2) plus CORE_127 (an item that equips a 4/1 weapon). Equipping
  replaces any weapon. [A]
- Inconsistent attack value: hero target uses `weapon.attack`, minion target uses a separate
  `playerAttackValue` that is never reset when the weapon breaks. [A] (see Q9)

### 8.5 Class / hero skills
- 9 skills at cost 2, once per turn (Enhance, Snipe, Lightning Strike, Disciple, Mend, Katar, Raise
  Dead, Power Within, Energy Shield). All have code, but **only the Sorcerer class is ever assigned**,
  so 8 of 9 are unreachable in play. [A] `class-skills/class-skills.js`, `initDecks.js:29-30`
- `data/` has 9 heroes with 3 abilities each (one an ultimate, cooldown 1 or 2, or -1 for a
  one-use ultimate), but abilities exist for only 6 heroes and only 5 heroes are marked active. [V-data]

### 8.6 Boons, buffs, curses
- **Boon**: either an aura-on-play that adds attack to other minions and is reversed when the source
  dies (`core.boons.js`), or a turn-only bonus that edits `currentAttack` only and expires at the next
  turn start. **Buff**: permanent stat change (`totalAttack/totalHealth`). **Curse/Debuff**: no
  mechanism, just bespoke overwrites. Boon recalculation applies to both players using
  `ctx.currentPlayer`, so it can strip the wrong side. [A]

---

## 9. Card pool coverage

Computed by cross-referencing every CORE card in `data/core.json` with the `CORE_xxx` ids that
appear in `hsclone`'s `lib/` code. [V-data + V-code]

| Class | CORE cards |
| --- | --- |
| A. Bespoke code exists in `hsclone` | **109** |
| B. Vanilla (no effect needed) | 8 |
| C. Keyword-only (generic keyword code) | 12 |
| D. Has an effect, **no** `hsclone` code | **3**: CORE_071 Ice Primordial ("Disable anyone attacked by this minion"), CORE_085 Ifriit Ward ("draw a card whenever a minion is healed"), CORE_130 Sentry Post ("your minions have +1 AP") |

"Bespoke code exists" is an upper bound on correctness: about 18 of those 109 disagree with their own
text and CORE_108's code never runs (Appendix A). **PRIME: 0 of 254 have code.** The 17+ ENTOURAGE
tokens are created by CORE cards; none has its own logic. [A]

---

## 10. Data schema and loader rules

`hsclone` read an **older schema** than the live Airtable data: [V-code]
`hsclone`'s JSON has `spellType`, `warcryNumber`, `spellContext`, empty `mechanics` for many cards;
the live data has `playType`, `playContext`, `numberPrimary/Secondary/RNG/Random/Overcharge`, and
richer `mechanics` (e.g. Fireballs: `[%RANDOM%, %DAMAGE%]`, `numberRNG: 3`).

Facts about `data/` [V-data unless tagged]:
- 429 card records: CORE 132, PRIME 254, ENTOURAGE 43. Ids are unique. Entourage ids are like
  `CORE_057a`; `isEntourage: true` marks them.
- Booleans are encoded as present-or-absent (`active`, `elite`, `collectible`, `isEntourage`).
  Missing numbers mean "not applicable" and **0 is a real value**.
- Symbols are wrapped as `%LIKE_THIS%`; `cardClass` is the literal string `"0 %CLASS_NONE%"` on 412
  records (17 have none). **Every card is classless.**
- `playType` is `TARGETED` or `GLOBAL` (no `%`). It disagrees with `%TARGET%` in `mechanics` on
  32 TARGETED cards without it and 3 GLOBAL cards with it. [A]
- Card `text` is HTML plus tokens: `%NUM%` (29 uses), `%NUM1%` (18), `%NUM2%` (2), and glossary
  words such as `%BULWARK%`. `%NUM%`/`%NUM1%` map to `numberPrimary`, `%NUM2%` to
  `numberSecondary` [I, consistent on all examples checked].
- `numberRNG` (CORE, 5 cards) and `numberRandom` (PRIME, 25 cards) never appear together and mean
  "number of random targets". `numberOvercharge` (9 PRIME cards) is overload. [V-data for the
  non-overlap, I for the meaning]
- Data quality: 57 cards have no `name` (51 prime + 6 entourage); 22 prime cards are inactive (all
  nameless) and 29 active prime cards are nameless; duplicate names "Marauder" and "Frosted Sword";
  54 entourage references with 18 unresolved (including typos like `PRIME112a`); constants has a
  typo "Driod". [V-data]
- **Correction to an agent claim:** four prime "minions" (PRIME_014 Archery Yard, _104 Perses, _251
  Conquest and Glory, _252 War and Ruin) were reported as lacking attack/health. They have both; they
  carry `%NO_ATTACK%` or special text. [V-data]
- Heroes: 9 records, only Atlas has `ability1/2/3` strings (`cost(1)\ncooldown(1)\ntype(...)...`);
  the others link through `abilities.json` by `hero`. [V-data]

**Loader rules** the engine's card loader must apply: merge CORE/PRIME/ENTOURAGE by id; strip `%...%`
to enums; treat absent booleans as false and never use `||` on numbers; resolve `entourage` strings
and warn on unresolved ids; drop or flag inactive/nameless records; reconcile `playType` against
`%TARGET%`; parse and sanitise HTML `text` and substitute number tokens; **fail loudly on a mechanic
symbol not defined in `mechanics.json`.** `inspiration` is never loaded (see CLAUDE.md).

---

## 11. Things not to copy (consolidated)

**Architecture**
- Dead-minion removal, winner detection, and UI timers living in the client. The engine must own them.
- Client-supplied objects trusted by moves (`selectedMinionObject`, the `data` passed to `killMinion`).
  Moves must read state from `G`, not from arguments.
- UI selection/hover/animation state stored inside `G`.
- Per-card-id switch statements duplicated across five files, and an id whitelist duplicating a switch.
- Non-determinism: `Math.random` in spells and turn order, `uuidv4()` inside moves, `random.Die` misuse.
- `counts` bookkeeping duplicating array lengths; debug flags (`enableCost: false`, `enableDebugCard`,
  pre-filled opponent board) enabled by default; a tic-tac-toe `ai.enumerate` left in `game.js`.

**Rule bugs**
- Fatigue deals 0; draw-into-full-hand silently drops the card; mulligan leaves duplicates in the deck.
- Weapon->minion ignores Guard; hero damage uses two different attack values; stale `playerAttackValue`.
- Armor ignores spell damage; Bubble ignores spell damage; spell-damage bonus scales heals and draws.
- Board limit not enforced by the engine; both-heroes-dead has no draw rule.
- `energy.subtract` clamps to `total`, losing extra Orb energy.
- `Math.abs(n - 1)` countdown hacks; own-board expiration loop kills the other board; `currentAttack >= 1`
  check runs before the reset.
- Boon recalculation strips attack from the wrong side and from minions that never received it.
- CORE_113 "sacrifice" never removes the minion; CORE_060/125 hit one target, not two (index 0 is falsy).

---

## 12. Design decisions (answered 2026-11-11)

The questions below were answered in `RULES-ANSWERS.md`. **All 24 proposed defaults were accepted.**
The text of each question and its default is kept for the reasoning.

| Q | Topic | Decision | Status |
| --- | --- | --- | --- |
| 1 | Classes/hero skills | none in v1; skills in Milestone 5 | accepted |
| 2 | First-release pool | CORE only (132) | accepted |
| 3 | Opening hands | first player 3, second 4 + The Orb; mulligan later | accepted |
| 4 | Energy | +1/turn to 10, costs always enforced, Orb energy not lost | accepted |
| 5 | Full hand | burn the drawn card, both cases | accepted |
| 6 | Fatigue | escalating 1, 2, 3... | accepted |
| 7 | Board limit | 7, engine-enforced, summon into full board fizzles | accepted |
| 8 | Double hero death | draw; no turn timer | accepted |
| 9 | Weapons | no hero base attack; weapon attack and durability; counter-damage when hitting a minion | accepted; engine readings (slice 6, not covered by the answer): a new weapon may attack the turn it is equipped; counter-damage and weapon damage are simultaneous; equipping replaces the old weapon silently |
| 10 | Guard scope | attacks only (minion and weapon) | accepted |
| 11 | Rush | attacks immediately, can hit hero | accepted |
| 12 | Double attack | two attacks per turn | accepted |
| 13 | Bubble | absorbs first damage from any source | accepted |
| 14 | Hero armor | absorbs all damage | accepted |
| 15 | Death order | simultaneous damage; engine removes dead in play order, then death effects | accepted |
| 16 | Spell damage bonus | damage only for now | **provisional** |
| 17 | Disable | cannot attack during its owner's next turn | accepted |
| 18 | Expiration | dies at the start of the caster's next turn | accepted |
| 19 | Hidden | untargetable by anything until it attacks | accepted; engine reading (slice 4): chosen targets and random picks skip hidden minions, area effects still hit them, a hidden Guard does not guard |
| 20 | Text vs behaviour | printed text wins; settle per card in Milestone 4 | accepted |
| 21 | Triggers | general trigger system from the start | accepted |
| 22 | Data-driven vs per-card | hybrid; investigated, see below | accepted |
| 23 | Number fields | defaults below | **provisional** |
| 24 | Nameless/inactive PRIME | ignore for now | accepted |

### Provisional items and how the engine accommodates them

- **Q16, spell damage bonus.** The author floated broadening it from "spell damage" to a general
  amplification stat (working names: *Spell Power*, *Enhancement*, *Potency*) that can also raise
  healing, and is unsure. **Engine rule:** the stat is applied per *effect kind* through one small
  config table (`damage: true, heal: false` for now), so changing the decision later is a config edit
  plus a test, not a refactor. Whatever is chosen, it must **never** scale draw counts, shield, or
  summon stats (hsclone's accidental behaviour).
- **Q23, number fields.** The author does not remember what every number field means. **Engine rule:**
  the loader keeps the raw fields (`numberPrimary`, `numberSecondary`, `numberRNG`, `numberRandom`,
  `numberOvercharge`) untouched and exposes them to effects only through named accessors, so the
  interpretation lives in one place. A consistency test asserts that each card's printed text, with
  tokens substituted, matches the number the engine will actually use. Mismatches are resolved
  card by card in Milestone 4 using RULES.md Appendix A and hsclone's behaviour.
- **"Things not yet remembered."** The author found nothing egregiously wrong in this spec but
  expects memory to return as work proceeds. Corrections are expected; they go into this file.

### Q22 investigation result (2026-11-11)
Grouping the 132 CORE cards by what their data fields say (type, playType, playContext, mechanics,
which numbers are present) gives **80 distinct signatures**. Only **54 cards (41%)** sit in a group of 3
or more; **62 cards (47%)** have a signature no other card shares. So the card data alone cannot drive
the effects, and a purely data-driven interpreter is **not viable**: effects such as "summon a 1/1
creature" or "give all friendly minions +1 health" need details that live only in the text or the code.
**Conclusion:** keep the hybrid, made precise. About 20 cards (vanilla and keyword-only) need no
effect definition at all; the other ~110 get a small TypeScript definition built from shared typed
effect primitives (damage, heal, draw, summon, buff...), with the data supplying the numbers and
presentation. This keeps the per-card knowledge from hsclone without its five duplicated switch files.

### Mulligan, for reference
A mulligan is an optional redraw at the very start of a game: after the opening hand is dealt, a
player can pick cards they don't want and swap them for fresh cards from their deck, once, before the
first turn. hsclone has the code (the first player is offered 3 cards, the second 4) but it is
switched off (`enableInitHandsStage: false`), so opening hands are dealt automatically with no choice.
Its remaining bug is that kept cards are not removed from the deck, so they would appear twice.
"Mulligan later" means skipping it in v1 and adding it later as an optional pre-game step.

## 12.1 The original questions (kept for the reasoning)

Each has a **proposed default**.

**Scope and fidelity**
1. **Classes and hero skills in v1?** All cards are classless today and only one class was ever
   playable. *Default:* no classes in v1; hero skills are Milestone 5.
2. **First-release pool.** *Default:* CORE only (132 cards); PRIME and heroes later.
3. **Opening hands.** hsclone: first player 3 cards, second 4 plus "The Orb"; mulligan off.
   *Default:* keep that; mulligan later.

**Core rules**
4. **Energy.** *Default:* standard +1 per turn to 10, costs always enforced; "The Orb" adds temporary
   energy that is not lost.
5. **Full hand.** *Default:* a card drawn into a full hand is burned, both at turn start and from
   effects.
6. **Fatigue.** *Default:* escalating damage on an empty-deck draw (1, 2, 3...).
7. **Board limit.** *Default:* 7 per side, enforced by the engine; summons into a full board fizzle.
8. **Simultaneous deaths of both heroes.** *Default:* the game is a draw. No turn timer in v1.
9. **Weapons.** *Default:* the hero has no base attack; a weapon gives attack and durability; attacking
   a minion with a weapon means the hero takes the minion's counter-damage (as hsclone does); one weapon
   attack per turn; a single attack value taken from the weapon.

**Combat semantics**
10. **Guard scope.** *Default:* Guard restricts **attacks** only (minion and weapon), not spells,
    warcries or skills.
11. **What "Rush" means.** hsclone's Rush attacks immediately and can hit the hero (Charge-like).
    *Default:* keep hsclone behaviour, but ask whether a minions-only Rush variant is wanted.
12. **Double attack.** hsclone's "Onslaught" = two attacks per turn. *Default:* implement
    `%DOUBLE_ATTACK%` as two attacks per turn.
13. **Bubble.** *Default:* absorbs the first instance of damage from **any** source.
14. **Hero armor.** *Default:* absorbs all damage, including spells.
15. **Damage and death order.** *Default:* damage is simultaneous; deaths are resolved by the engine in
    play order after each action; death triggers fire after removal.
16. **Spell damage bonus.** *Default:* only increases damage numbers, not heals/draws/shields.
17. **Disable.** hsclone: a disabled minion loses exactly one of its owner's attack opportunities
    [likely, not live-verified]. *Default:* "cannot attack during its owner's next turn".
18. **Expiration** (CORE_114 "Cryptic Curse"). hsclone ticks the countdown on both boards every turn
    start, and its own-board loop kills the wrong board. *Default:* the target dies at the start of the
    caster's next turn. **Needs your intent.**
19. **Hidden/concealed.** *Default:* cannot be targeted by anything until it attacks.

**Cards and text**
20. **Text vs behaviour** (Appendix A). *Default:* printed text is authoritative unless you say
    otherwise; we resolve each card in Milestone 4 with a test.
21. **Triggers.** EVENT/ON_DEATH/ON_END/COMBO/MYSTERY have no hsclone code but PRIME depends on them and
    CORE_071/085/130 need EVENT. *Default:* design a general trigger system in 1b, even if only CORE needs it.
22. **Data-driven or per-card code?** *Open, needs investigation at the start of 1b:* how many of
    the 132 CORE cards can be expressed purely from `playType + playContext + mechanics + numbers`.
    *Default:* a hybrid, with data-described effects for common verbs and small per-card scripts for the rest.

**Data**
23. **Number fields.** *Default:* loader treats `numberPrimary` as the main magnitude, `numberSecondary` as
    the second (health for buffs), and `numberRNG`/`numberRandom` as the random-target count. Please
    confirm, especially the cases where primary is 0 and secondary carries the amount.
24. **Nameless/inactive PRIME cards.** Moot if the first release is CORE only. *Default:* ignore for now.

## 13. Not verified

- **No new live tests were run in this milestone** beyond the earlier session (selecting/casting
  spells, summoning, attacking, Guard targeting, hero damage, playing a minion).
- Not live-tested: Disable and Expiration timing, Onslaught, Rush, weapons, hero skills, Bubble,
  warcry targets, the exact source and count of `killMinion` errors, double-death outcomes.
- The agents' reports were spot-checked (items tagged [V-...]) but not re-derived; the per-card behaviour
  list in Appendix A is agent-reported.
- `boardgame.io` source was not available, so statements about how 0.35 rejects moves are inference.
- Nothing here has been checked against the Airtable base's `inspiration` column, deliberately.

## 14. Implications for the engine (1b)

1. Pure TypeScript, deterministic: all randomness from `ctx.random`; ids from a counter, not `uuid`.
2. The engine alone resolves death, win/draw, board limit, costs, and legality. No client timers, no
   client-declared winners.
3. `G` holds game state only, with no hover/selection/animation fields.
4. One `legalTargets` query used by both the UI and the move validators.
5. A trigger/event system designed up front (EVENT, ON_PLAY, ON_DEATH, ON_END, COMBO).
6. A normalised card type and a loader with the rules in section 10; effect descriptors for common verbs,
   escape-hatch scripts for odd cards.
7. Tests first, headless: the first milestone test is a scripted game to a winner. Port `hsclone`'s unit
   tests only where they match this spec (38 of its 101 fail).

---

## Appendix A: CORE cards whose text and implemented behaviour disagree

From the card-effects review [A]; to be resolved card by card in Milestone 4 (see Q20).

| Card | Text says | `hsclone` does |
| --- | --- | --- |
| 060 Shock and Awe, 125 Erratic Blitz | 2 random enemies | hits one (index 0 is falsy) |
| 063 Fireballs | 3 random enemies | up to 3 picks that can collide |
| 051 Nature's Wrath | damage then draw | no draw |
| 098 Spin Chain | draw a card | draws N cards |
| 055 Surveying Drone | draw 3, keep 1 | draws 2 |
| 104 Armor Distribution | Demonic minions +2 HP | uses the Idol race |
| 019 Little-big Leader | +1 HP | +1 attack |
| 054 Wolpertinger | +1 HP | +1 attack, current only |
| 075 Intimidation | HP to 1 | sets attack to 1 |
| 106 Imbue Strength | this turn | permanent |
| 127 Strength Implant | this turn only | persistent 4/1 weapon |
| 096 Disabling Kick | disable (JSON) / "return to hand" (comment) | dead code |
| 113 Ritual Sacrifice | sacrifice a minion | sacrifice never removes it |
| 058 Focus Shot | JSON 4, comment "5 if Creature else 3" | flat N |
| 088 Aspect of Enhancement | double health | doubles current, not total |
| 089/090 Invocations | destroy (gated by attack) | 9000 damage; gate only in target selection |
| 071, 085, 130 | see section 9 | no code |
| 108 Unearthed Crater | adjacent +2 | dead code, never runs |

**Engine note (slice 6):** cards of type `item` (about 20 in CORE: potions, scrolls, buffs) are one-shot effects and play exactly like spells. CORE_081 ("restore 2 HP before every attack") needs a pre-attack hook and is left for Milestone 4.

## Appendix B: card behaviour decisions made while porting all 132 CORE cards

All 132 CORE cards are playable. Where the printed text, the data numbers and `hsclone` disagreed, the
printed text won (Q20). These are the readings the author has not yet confirmed; change the definition
in `engine/definitions/core/` (and its test) if any is wrong.

**Appendix A discrepancies, resolved as the printed text says:** 019 +1 Health (not attack), 054 +1
Health, 051 draws the card, 055 draws 3 and keeps 1, 060 and 125 hit two *different* targets, 063
distinct picks, 075 sets Attack (not Health) to 1, 098 draws one card, 104 buffs *all* your minions (not
just Demonic), 106 is for one turn, 127 is for one turn only, 096 is not a CORE card here.

**Choices the text leaves open:**
- **"All friendly minions" warcries (019, 041)** buff your *other* minions, not the warcry minion itself
  (hsclone's 041 also excluded itself). 054/059/099 warcries *can* aim at the warcry minion itself
  (hsclone could not); the same is true of the existing CORE_021.
- **088** doubles *current* health and raises max health by the same amount, so it acts as a +X Health buff.
- **056** sets current *and* max health to 1. **075** sets the *base* Attack to 1; auras and this-turn
  boosts still apply on top.
- **Destroy (089, 090, 101, 126, 113)** is not damage: it ignores Bubble. 089/090 are gated when choosing
  the target. 126 may target either side (the text says "a damaged minion"); 093 may too.
- **070/109 Transform** replaces the minion in the same slot with a fresh token (damage, buffs,
  keywords, Disable and Expiration all gone; summoning sick).
- **092 Steal** puts the minion on your board with summoning sickness; with a full board nothing happens.
- **103** restores a friendly minion to full health and gives Guard.
- **113** sacrifices a friendly *Demonic* minion (the data says Demonic; the text says Undead).
- **119 Lifesteal** heals your hero for the damage actually dealt (a Bubble-absorbed hit heals nothing).
- **045/051/055 "choose one"** are chosen when playing: `PlayCard.choice`. 055 offers "keep card 1/2/3"
  and keeps the last card if the deck has fewer than three; an empty deck does nothing (no fatigue).
- **049** adds an *empty* energy slot (capped at 10), unlike 043 which gives energy this turn only.
- **057** summons one random token; summoned minions never run warcries. 057b (formerly TacMedic) had a warcry that
  could therefore never fire, so on 2026-11-11 the author turned it into a plain 2/4 Guard minion, now named Frontline
  Guardsman (changed in Airtable and pulled).
- **020** summons one of its two 1/1 tokens at random (they are identical apart from the name).
- **050** hits the chosen enemy for 4 and every *other* enemy (hero included) for 1.
- **Spell damage (011, 015, 028, 037; Q16)** raises each damage hit of your *spells* by its amount and
  stacks. It never affects warcries, heals, draws, armor or summons. `engine/rules/spell-power.ts` is
  the one place that decides which effects it raises.
- **Auras ("Boon" on a minion: 003, 062, 108, 130)** are recomputed after every step, so they vanish
  when the minion dies and re-aim as the board changes. 003/130 reach your *other* minions; 108 reaches
  the two neighbours; 062 gives your Creatures Rush.
- **This-turn boosts (048, 106, 111, 127)** end when the turn ends. 127 equips a 4/1 weapon that is
  removed at the end of the turn if unused; with a weapon already equipped it adds +4 Attack to that weapon for this turn only
  (the weapon keeps its durability and the +4 is taken back at end of turn, via `tempAttack` on the weapon). Author, playtest
  2026-11-12: a boon, not a permanent buff (this replaced an earlier reading where the +4 lasted the weapon's durability). 048/111 affect minions only (a hero has no Attack of its own).
- **081** heals 2 *before* the attack, so counter-damage cannot kill the hero first. The 2 is in the card
  text only (no data field), so it is a constant in the definition.
- **084** picks a random card from the cards your opponent has played from hand (tracked in
  `GameState.played`); nothing if they have played none; a full hand burns it.
- **007** destroys the opponent's weapon and nothing else (hsclone also stopped their hero attacking; the text does not say
  so). **Confirmed by the author, 2026-11-11: follow the text, it only destroys the weapon.**

## Appendix C: PRIME card behaviour decisions (2026-11-12)

Readings I chose while giving PRIME cards definitions (`engine/definitions/prime/`). None of these is approved yet; change any you disagree with.

- **Cost changes** (`engine/rules/cost.ts`, `effectiveCost`): a card's own rule (`ownCost`) and your minions' `costMods` all add up. A net reduction
  stops at the floor ("not less than 1") but never raises a card above its printed cost; never below 0. Only the owner's cards are affected.
  220 minions -2 (floor 1); 142 spells only, not items; 086 -1 per *other* card in hand; 085 -1 per minion on *either* board; 247 -1 per
  point of damage your hero has taken (armor does not count). 037 (Skelly, "your minions cost 3 more") is not built: it is tagged as a warcry.
- **Suppress (SILENCE)**: the minion loses its card's behaviour (triggers, auras, Spell Damage, cost changes, demise, conditional effects),
  all keywords (including Can't Attack) and any Disable. Its Attack, Health, damage and buffs stay. It is a one-way flag (`silenced`).
  Heroes cannot be Suppressed. 201 Suppresses first, then deals its 1 damage (so a demise does not fire).
- **Overcharge (N)**: playing the card locks N of your energy at the start of your *next* turn only (stacks if you play several, never below 0).
  Applies to every card with the OVERLOAD mechanic, whatever its type. `OverchargeGained` is an event, so 205 can react to it.
- **"While damaged" and other self conditions** (009, 035, 041, 024, 244, 022, 006, 174) are rechecked after every step and vanish when the
  condition stops (healed, weapon gone). 022's Onslaught and 006's Stampede are *not* given at creation even though the data lists them.
  174's Attack always equals its Health (other auras still add on top).
- **Keywords the data tags but the card only grants** (066, 054, 115, 124 Guard; 115 Stampede; 160 Bubble): the minion itself does not start with them.
- **Damage triggers**: 239 reacts to any minion taking damage (either side, itself included); 237 to a *friendly* minion (also when it dies of it);
  016 only to its own damage. `MinionDamaged` now carries the damaged minion's owner.
- **End/start-of-turn triggers**: "at the end of your turn" fires only on your own turn (210, 102, 061, 046, 052, 176); 104 Perses grows at the end of *every*
  turn. 059 hits a random enemy (hero included) at the start of your turn.
- **Random picks** never repeat a target within one effect, and enemy picks include the hero ("enemies"): 167, 202, 059. Random *friendly* picks may
  be the card itself (046, 052).
- **Spell-cast triggers** (073, 055, 141, 076, 069, 050) fire for spells only (not items) and only for your own casts. **Death triggers** (027, 018)
  see every minion on either board die; 128 only your own Creatures.
- **Misc**: 062 hurts itself (author, playtest 2026-11-12: it enters as a 5/4); 217 hurts your own hero; 061's "take 1 damage" is the Hut itself; 082 can aim at either side's 7+ Attack minion; 150 disables the
  survivors; 232 lowers Health by 1 (not damage); 241 does not spend the armor; 231 counts your hero too; 123's heal goes to your own hero.

### Mysteries (2026-11-12; the Mystery cards were rewritten per `balance/PRIME-DISTANCE.md`)

- **Placing**: a Mystery spell goes face down in your single Mystery slot instead of resolving (`PlayerState.mystery`). You can hold only one: a second
  cannot be played (`MYSTERY_ACTIVE`, and `legalActions` does not offer it). It counts as casting a spell for triggers (marked `mystery: true` on the
  `CardPlayed` event, so other Mysteries do not react to it) but is not added to the "cards played" history.
- **Reacting**: only during the OPPONENT's turn, once, then it is spent (`MysteryRevealed`). Each Mystery has a **category** the opponent is told
  (Attack, Spell, Minion, Damage, Death); the owner sees the card. The log says "sets a Mystery (Attack)" and reveals the card when it fires.
- **Before the action**: Attack-category Mysteries and the spell-redirect one run BEFORE damage, so they can change the target or kill the attacker (in which
  case the attack does not happen). Others run after their event (a minion played, the hero damaged, a minion died).
- **Rewritten cards**: 143 Armor = max(4, 2 x attacker's Attack), after which the hit lands; 127 the attacker is Disabled and loses 2 Attack *before* it hits
  (the attack still happens, weaker); 148 damage = your hero's missing Health (30 - health, armor ignored); 126 your weapon hits the attacker first for its
  Attack without losing durability, needs a weapon; 157 two Guard Mice, the attack goes to one (works on a hero weapon attack too); 152 a targeted
  enemy spell hits a random minion its caster controls (unchanged if they have none); 146 copies the spell to your hand (spells only, never items or a placed
  Mystery); 159 halves Health (rounded up) and Disables; 129 damage = the minion's Cost; 158 returns your dying minion (never a token) to your hand, 1 cheaper
  (`CardInstance.costDelta`); 156 on 5 or more damage in one hit: heal 5 and draw.
- **Other Mystery cards**: 132 is a plain spell (reveals Concealed minions, destroys the enemy Mystery, draws only if it did); 067 takes the enemy's Mystery (destroyed
  if you already hold one); 250/149 buff at the end of your turn while you hold one; 045 grows whenever any Mystery is played. 147 (next Mystery costs 0) is not built yet.

### Choose-one, overload and enrage rewrites (2026-11-12; `balance/PRIME-DISTANCE.md`, applied in Airtable by `balance/airtable/prime-families.js`)

- **Choose-one**: 111 (cost 3) +1/+1 to your Creatures, or a 3/2 Wild Cub (PRIME_111c) with Rush; 112 2 damage and 2 Armor, or 1 damage and a card;
  113 +3 Attack and Rush, or +3 Health, Guard and heal your hero 3 (a friendly minion); 120 (cost 6) 4 damage to a minion and 1 to its neighbours, or 1 to every
  enemy minion and Disable them; 121 (cost 5) +1 energy slot and a card, or 2 cards that cost 1 less (`CardInstance.costDelta`, kept for the game);
  123 draw 2 and take 2, or heal your hero 5 and give a friendly minion Bubble; 115 (5/3) Rush and +1 Attack, or +3 Health and Guard; 124 (4/6) +3 Attack and
  Rush, or +3 Health, Guard and heal your hero 3; 119 (2/3) 2 damage to a *damaged* minion, or Suppress a minion and give it -1 Attack.
- **Overload**: 203 (cost 2) 3 damage to a minion, draw if it dies (a minion only now); 208 4 damage to a minion and 2 to its neighbours; 209 2 damage to all
  enemy minions (not the hero), then Disable survivors left at 1 Health, Overcharge 2; 202 3 damage to ONE random enemy, Overcharge 1; 204 (2/2 weapon)
  Disables what it hits (a minion, or the hero); 200 (2/1 Onslaught, Overcharge 1) dies at the end of your turn if it attacked twice; 213 (6/7 Guard) heals your
  hero 1 when attacked; 205 grows whenever ANY player plays an Overcharge card.
- **Enrage**: 009 (1/4) +2 Attack and Rush while damaged; 035 (3/6) +1 Attack per damage taken, max +4; 041 (1/2) gains a permanent +1 Attack each time it is damaged;
  024 (2/4 Guard) heals 1 each time it is damaged; 244 (4/8 Rush) Onslaught while damaged; 022 (3/3) Onslaught only on turns your hero took damage (`heroHurtOnTurn`,
  any damage, armor included); 006 (1/2) +1 Attack and Rush while you have a weapon.

### The Giants, the keyword pile and friends (2026-11-12; applied in Airtable by `balance/airtable/prime-giants.js`)

- **085 Bark Creature (10)**: 1 less per minion that has died this game, either side, max 6 (`GameState.deaths`).
- **086 Spider Mech (12)**: 1 less per card you played this turn and your previous turn, max 6 (`PlayerState.plays`; rotates at the start of your turn).
- **247 Volcanic Giant (12)**: 1 less per point of Armor your hero has lost to damage, whole game (`PlayerState.armorSpent`); Armor gained does not count.
- **214 Spirit of the Night (5/5)**: Guard and Bubble; your OTHER minions have Rush (aura).
- **107 Cronus**: while it is on a board, the owner's OPPONENT's turns last 30 seconds (`opponentTurnSeconds`); the owner's stay 60.
- **228 The Sorcerer's Stone (6)**: destroys minions with 4 or more Attack (either side), then both players draw a card.
- **078 Infernal Nest (0/7)**: at the start of its owner's next turn it deals 4 to ALL minions, itself included, then is destroyed.
- **105 Nightmare**: sets BOTH heroes' Health to 18.

### Exact bodies and warcries (2026-11-12; applied in Airtable by `balance/airtable/prime-bodies.js`)

- **Demise**: 013 (1/3) draws; 019's Warrior Bot has Rush; 004 hits a random enemy minion for 2, else the hero; 246 swaps your weakest minion (least Attack + Health)
  for the enemy's strongest; 070 hits all enemies (minions and hero) for 2 and gives your minions Bubble.
- **Stats**: 007 1/3, 040 4/4, 082 4/3, 095 4/5, 161 2/3, 049 2/2, 055 2/3. **040** has Onslaught only while undamaged.
- **While on the board**: 043 +1/+1 when YOUR characters are healed; 176 heals your most damaged minion 3 and your hero 1 (end of your turn); 237 gains 2 Armor when a
  friendly minion dies; 239 +1 Attack this turn when an ENEMY minion takes damage; 049 pings a random enemy minion when you summon another minion; 055 hits only enemy
  minions; 141 +1 Attack this turn per spell and draws at 4 Attack; 104 +1/+1 at the end of your turn if it attacked, else -1/-1; 142 spells cost 1 less but your hero takes 1
  per spell; 220 only minions costing 4+ get 2 less (never below 3).
- **Warcries and spells**: 017 choose heal a character 3 or deal it 1; 020 Suppress a minion with Cost 3 or less; 032 Suppress an enemy minion, draw if its card had a warcry or
  demise; 048 swap Attack and Health and Disable it; 082 destroy a 6+ Attack minion that is damaged or has attacked this turn; 095 destroy the enemy weapon and gain its Attack as
  Armor; 161 halve a minion's Attack (rounded down); 028 +3 Attack this turn; 002 friendly minion +2 Attack this turn and 1 damage to it; 224 destroy a minion and summon a 2/2
  Husk for you; 241 damage = your Armor, then lose half of it (rounded up); 233 +2/+4 to a damaged minion.
- **Return to hand** (`returnToHand`): 026 and 015 return a friendly minion (not the enemy's, not themselves); 185 returns one costing 1 less (`CardInstance.costDelta`) and with Rush
  when played (`CardInstance.rushOnPlay`). A full hand destroys the minion.

### Batch F: Poison, untargetable, the opponent as a target, and assorted cards (2026-11-12)

- **Poison / Touch of Death** (`CardDef.poison`): in combat, a poisonous minion destroys whatever minion it actually DAMAGED; a popped Bubble means no damage, so no poison. Works
  both ways (attacking or being attacked). 229 only on Creatures. A Suppressed minion loses it. Hero weapon hits are not minions, so they do not poison. 060 (1/3) and 197 are Concealed.
- **Untargetable** (`CardDef.untargetable`): 012 (2/3) cannot be aimed at by a spell or an item; a warcry or an attack can. Suppressed, it can be targeted.
- **For the opponent**: 100 summons a 3/3 Cursed Spawn (demise), 096 two 1/1 Toucans (warcry), 092 gives two Sushi (+1/+1 items on a friendly minion), 057 gives them an energy slot.
  088 copies a spell to the OTHER hand than the caster's (a face-down Mystery is not copied). 221 destroys one of YOUR energy slots (total -1 for the rest of the game).
- **Random**: 071 destroys one random enemy minion with 2 or less Attack; 242 destroys a random number (0 to all) of all minions, both sides; 187 makes two random enemy minions each
  deal their Attack to the other; 014 does 4 separate points of damage to random characters on either side (heroes included, and itself); 190 deals 2 to 4 to the target you choose;
  090 draws an extra card at the start of your turn half the time.
- **Fresh spells and items**: 223 destroys a friendly minion and deals its Attack to all enemy minions; 116 +2/+2 and Guard to yours; 194 destroys your weapon and deals its Attack to all enemies;
  234 draws only if the enemy minion survives; 151 draws if it was already Disabled (checked before the damage); 211 draws a card costing 3 less; 219 takes the first two minions from your deck;
  147 makes your next Mystery this turn cost 0 (once).
- **Minions**: 079 pops every other Bubble and gains +3/+3 each; 087 Spell Damage +1, draws on death; 093 heals a random friendly minion 2 when you summon another; 215 +1 Health to a random
  friendly minion at the end of your turn; 245 deals 8 to a random enemy at the end of your turn; 249 destroys a random enemy minion whenever you play a card (a Mystery or weapon too, not itself);
  098 summons a Guard 2/2 at the end of your turn; 253/254 affect every OTHER minion (they are 10/10s) and leave Fear / Despair on death; 251 steals 2 random enemy minions and leaves Glory.
- **037 Skelly (reading to confirm)**: a standing effect, while it is on the board your own minions cost 3 more. The data tags it as a warcry, so it may have meant something else.

### Random cards from a pool (2026-11-12)

- **The pool** (`engine/rules/card-pool.ts`): every real CORE or PRIME card (named, active, not a token) the engine can play faithfully, sorted by id so the same seed picks the same
  card. It grows by itself as cards get definitions. "A random X" picks from the pool cards that match X.
- **Add to hand**: 140 Tome of Spells (a spell costing 3 or less; the audit's twist), 186 Gift Box (2 any cards), 216 The Ritual (a Demonic minion; the cards call that race Undead),
  091 Harry (a Mythic minion), 154 Amaad (a random card costing 4 less whenever you play a card from hand, not for itself). A full hand burns the card.
- **Summon**: 084 Serene Valley (demise: a random Creature), 227 Zap (2 damage; if the minion dies, a random Demonic minion costing 4 to 6 for you).
- **Known quirk (not changed)**: events are handled after deaths in `settle`, so a minion that arrives from a demise can react to a spell cast earlier in the same action.

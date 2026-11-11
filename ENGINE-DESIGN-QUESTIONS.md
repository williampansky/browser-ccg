# Engine design: 5 questions to pick up later

Written 2026-11-11 so you can resume after a break. The full proposal is in
[ENGINE-DESIGN.md](ENGINE-DESIGN.md); this file is just the five decisions I need from you before I
write the rules engine, with plain-language context and my recommendation for each.

**Nothing is blocked except the engine's rules code.** The card loader (`engine/cards/`) is done and
tested, and the rules spec ([RULES.md](RULES.md)) is approved.

**How to answer:** tick a box (put an `x` between the brackets), add notes if you want, and tell me
when you're done. Leaving one blank means "go with my recommendation".

---

## Where we left off

**Superseded.** All five questions below were answered (the recommendations were accepted) and the
engine was built from them: slices 1-6 of ENGINE-DESIGN.md section 10 are done and there is a playable
board at `/play`. See "Current state" and "Next up" in CLAUDE.md for the live status. This file is kept
as the record of the decisions.

---

## 1. Should the engine be independent of boardgame.io?

**What it means:** the rules live in plain TypeScript that knows nothing about boardgame.io (or React).
A thin adapter later plugs it into boardgame.io for the browser game and multiplayer.

**Why I recommend it:** games can be played, tested and simulated with no framework; bots and the UI use
the exact same code path; and upgrading boardgame.io later can't break the rules.

**The cost:** I write the (small) turn loop myself instead of using boardgame.io's built-in phases.

- [x] Yes, independent engine with a thin adapter (recommended)
- [ ] No, build directly on boardgame.io's phases and moves
- [ ] Not sure, explain more

> that's fine. as long as we still integrate into boardgame.io's phases and moves framework down the road

## 2. How should card effects be written?

**What it means:** each card that does something gets a short TypeScript definition built from shared
building blocks, with the numbers read from your card data. For example:

```ts
// Fireballs: "Deal 1 damage to three random enemies"
defineCard('CORE_063', ({ n }) => ({
  onPlay: [damage(randomEnemies(n.random), n.primary)],
}));
```

Vanilla and keyword-only cards (about 20 of the 132 CORE cards) need no definition at all.

**Why I recommend it:** your card data alone can't describe effects (47% of cards have a unique pattern),
and hsclone's approach of big per-card switch statements in five files is what we're avoiding. Short
definitions over shared blocks keep each card to a line or two.

- [x] Yes, per-card definitions over shared building blocks (recommended)
- [ ] I'd rather effects were driven purely by the Airtable data (note: I found that isn't enough on its own)
- [ ] Something else:

> 

## 3. Use `immer` for updating game state?

**What it means:** `immer` is a small library that lets the code "change" the game state in a natural way
while safely producing a new copy each time, so the old state is never modified (which matters for
undo, tests and bots). The repo already depends on it indirectly through boardgame.io.

**Why I recommend it:** less code and fewer bugs than hand-writing the copying.

- [x] Yes, use immer (recommended)
- [ ] No, copy the state by hand
- [ ] No preference

> 

## 4. How should the per-card files be organised?

**What it means:** where the card definitions from question 2 live.

- **Option A (recommended):** one file per non-trivial card, e.g. `engine/definitions/core/core-063.ts`.
  Matches the old repo's one-file-per-card habit. Vanilla and keyword-only cards have no file.
- **Option B:** group by effect type, e.g. `damage-spells.ts`, `summon-cards.ts`. Fewer files, but harder
  to find a specific card.
- **Option C:** one big file per set (`core.ts`). Simplest, but long and noisy in diffs.

- [x] A: one file per non-trivial card (recommended)
- [ ] B: grouped by effect type
- [ ] C: one file per set
- [ ] Other:

> 

## 5. Is the build order right?

**What it means:** the engine is built in slices, each committed separately with its tests green:

1. State, setup, turn flow, energy, drawing, hand limit, fatigue, end turn, win by health.
2. Play minions, board and the 7 limit, summoning sickness, attacking, Guard, death.
3. Spells: legal targets, damage/heal/draw, targeted and global play.
4. Keywords: Bubble, Rush, double attack, hidden, no-attack, Disable, Expiration.
5. Triggers: warcries and event cards, listing all legal actions.
6. Weapons and armor.
7. A test where two random bots play many seeded games and the rules invariants are checked every move.

**Things you might want changed:** getting a bot playing sooner (so you can try the game earlier),
doing spells before keywords, or pulling weapons forward.

- [x] Order is fine (recommended)
- [ ] Change it:

> 

---

## Anything else

> 

# Design ideas

A running log of card, hero and mechanic ideas: things we might build, and what we decided about them. Newest entries at
the top of each section. This is not the rules spec (`RULES.md`) and not the roadmap (`ROADMAP.md`); an idea moves out of
here when it becomes a card in Airtable or a rule in `RULES.md`.

This repo is public, so **do not name the real-world game or character an idea came from** (see "Airtable and the
`inspiration` column" in `CLAUDE.md`). Describe the idea in our own terms, and differentiate names and mechanics.

**Status tags:** `idea` (just a thought) · `drafted` (numbers written down) · `building` · `shipped` · `dropped` (say why).

## How to add an entry

```
### Name of the idea (`status`, date)
One line: what it is and why it is interesting.
- The design (cost, stats, text, or the three skills).
- Engine: what exists already, what is new.
- Open questions.
```

## Heroes

### The Lone Warden: companion druid (`idea`, 2026-11-13)
A hero built around **one strong companion** (a Bear) instead of a swarm. Different from Forsaken Druid, which already has
Spirit Animal and True Form, so if this ships, decide whether it replaces Forsaken Druid's identity or sits beside it.

Three skills (all numbers are first guesses):
1. **Call the Bear** (cost 2, cooldown 1): summon a 2/4 Guard Bear. If you already have one, restore 3 Health to it and give it +1 Attack.
2. **Maul** (cost 4, cooldown 2): your Bear gains +3 Attack and Rush this turn.
3. **Wild Shape** (cost 8, once per game): your Bear gets +4/+4 permanently, your hero gets 6 Armor, and the Bear can attack twice this turn.

- Engine: skills, cooldowns and ultimates exist (`engine/heroes/`, `RULES.md` Appendix D). New: a "your Bear" selector (find by card id) and a
  "one Bear at a time" rule for skill 1. A Bear token goes in `engine/heroes/tokens.ts`.
- Open: ties to the Mythic below (same Bear token); no art.

## Cards

### Warden of the Long Road: bonded companion (`idea`, 2026-11-13)
**Mythic minion**, 5 mana, 4/5 (one copy per deck). Warcry: summon *Bonded Bear*, a 4/4 Guard.
**Bond:** while both are on the board each has +1 Attack. If the Warden dies, the Bear gets +3/+3. If the Bear dies, the Warden returns to your hand.

- Engine: entourage token, self-aura, demise effects and `returnToHand` exist. New: a "while both are alive" condition on the aura.
- Why: a "kill the bear or kill the druid" decision for the opponent. Cheapest way to test whether bonding is fun before building the hero.
- Open: should the Bear be the weak point (kill it and the Warden weakens) or the strong point (kill the Warden and the Bear snowballs)?
  As written it is both, which is cleaner to explain but riskier to balance.

## Mechanics

(None logged yet.)

## Dropped

(None yet.)

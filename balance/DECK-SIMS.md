# Starter-deck sims (2026-11-12)

`npm run sim -- 40 greedy core|prime|mixed|all`: every starter deck of the set plays every other, 40 games per pairing, seats alternating, greedy bot
(about 90 s for 8 decks, 190 s for 12). **40 games per pairing is noisy (about +-8 points per pairing, +-4 overall)**: read these as tiers, not rankings.

Decks are score-based archetypes in `engine/starter-decks.ts` over a card pool: CORE (12 decks), PRIME (10), mixed Core + Prime (8). The picker offers all of them;
"Surprise" and "Random starter deck" stay CORE-only so CORE's balance numbers do not move.

## A bot gap that was hiding every Mystery deck (fixed)

First run, before the fix: Mysteries 15%, Storm 18%, Mystery Tempo 21%. The greedy bot never played a Mystery: `isBadPlay` called it "a spell that changes nothing" (its
comparison did not look at the Mystery slot), and `evaluate` valued a face-down Mystery at 0 while a card in hand is worth 1.5. Fixed in `engine/bots/common.ts` (the comparison now
sees the Mystery slot, spell discounts, Health floor and free-spell flags) and `engine/bots/greedy-bot.ts` (new weights `mystery: 3`, `overcharge: 1.5` per locked energy).
This also makes the AI in `/play` set Mysteries. After the fix: Mysteries 30%, Mystery Tempo 38% (Storm still 15%).

## Results after the fix (overall win rate against the other decks of the set)

| CORE (12) |  | PRIME (10) |  | Core + Prime (8) |  |
| --- | --- | --- | --- | --- | --- |
| Card Advantage | 65% | Swarm | 85% | Mixed Guard Wall | 85% |
| Burn | 61% | Guardians | 83% | Poison Wall | 73% |
| Undead | 58% | Sprites | 66% | Tribal Mix | 64% |
| Creature Pack | 57% | Assassins | 53% | Mixed Midrange | 55% |
| Guard Wall | 55% | Prime Control | 41% | Mixed Control | 45% |
| Rush Down | 52% | Spell Chain | 36% | Mystery Tempo | 38% |
| Control | 50% | Prime Aggro | 36% | Mixed Aggro | 25% |
| Midrange | 49% | Giants | 36% | Storm | 15% |
| Aggro | 40% | Overcharge | 35% |  |  |
| Spellslinger | 40% | Mysteries | 30% |  |  |
| Lockdown | 38% |  |  |  |  |
| Armed | 36% |  |  |  |  |

## What to read from it

- **CORE is in a healthy band** (36% to 65%). The two new decks that started at 32% and 11% (Creature Pack, Undead) were broken by their filler: it took the cheapest cards,
  so the decks averaged 1.2 mana. They now fill by curve and sit at 57% and 58%.
- **PRIME is lopsided.** Swarm and Guardians beat nearly everything, and every Guard-heavy deck does well in the mixed set too (Mixed Guard Wall 85%, Poison Wall 73%). That is either a
  real PRIME problem (22 Guard minions, several with healing or Armor, and a lot of 4+ mana bodies) or the greedy bot being bad at attacking through Guard. The CORE Guard Wall
  deck is only 55% in the same bot's hands, so I lean towards the PRIME Guard cards being strong, but the sim cannot tell the two apart.
- **Mystery, Overcharge and burn decks are still weak** (Mysteries 30%, Overcharge 35%, Storm 15%). The bot now plays them, but a one-move lookahead cannot value a trap that
  fires on the opponent's turn, or a spell whose cost is next turn's energy, so these are probably still undervalued by the bot rather than bad cards. Treat as unproven.
- **Giants (36%)** needs the Giants' discounts to come together; with a bot that plays the cheapest thing first, it often does not.

Not done: a card-level win-rate table for PRIME (the `balance/inclusion.node.ts` script is CORE-only), and no card was changed on this evidence.

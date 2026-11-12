# Balance proposals (not applied, not committed)

Apply in order: `node balance/apply.node.js balance/proposal-1.json balance/proposal-2.json balance/proposal-3.json`
then `npm run sim -- 200 greedy`; undo with `git checkout data/core.json`. Each entry has a `why`.
Airtable is the source of truth, so adopted changes must be made there too or the next pull overwrites them.
All three together change 51 cards (numbers, costs, two texts, one optional mechanics change on CORE_007).
Adopting them required updating the engine tests that assert card numbers (done 2026-11-12 for the set applied to `data/`).

| Greedy bot, 200 games per pair | Baseline | After 1 | After 1+2 | After 1+2+3 |
| --- | --- | --- | --- | --- |
| Aggro vs Control (Aggro win %) | 33 | 43 | 50 | 54 |
| Aggro vs Midrange | 46 | 53 | 55 | 55 |
| Midrange vs Control | 50 | 57 | 56 | 60 |
| Worst card, win rate when played | 18% | 27% | 36% | 33% (Mutate), 39% next |

Cost curve (cards per cost, 132 cards): before 0:6 1:30 2:23 3:24 4:22 5:13 6:6 7:6 8:1 10:1;
after proposal 1+2: 0:6 1:26 2:29 3:22 4:17 5:18 6:9 7:3 8:2.

Caveats
- The random bot is too noisy to judge decks with (Aggro goes 11% to 90% depending on pairing); use greedy.
- Earthen Primordial, Fallen Angel and Nature Dragon stay at 80-93% "when played", but they are
  only played in long games the player is already winning, so this is partly confounded. Check them
  in playtesting before trimming further.
- Shot from Above, Mutate, Infernal Potion and Wolpertinger stay low; the bot may undervalue them.

Not number tweaks (need engine or text work; for the legal-distance goal these matter more):
- CORE_083 vs CORE_053 were identical; 083 is now a big finisher, but several other pairs are still
  near-copies in effect shape (the 1-mana damage spells, the Disable group, the Guard group).
- Replacing exact-text effects with new ones is the real distance step. Candidates: one-line effects that are
  a direct copy of a well-known effect (draw 2 for an item, steal a minion, set-health-to-1, destroy
  an attacker-3-or-less minion). Give each a twist (a condition, a cost in cards, a delayed effect).


---
## Passes 2-4 (second round): a better instrument, and what it overturned

The three-deck sim above is noisy (+-3.5% at 200 games per pair) and its decks change whenever costs change, so
the "improvement" table above is **weak evidence**. Round two adds `balance/inclusion.node.ts` (+ `run-incl.sh`,
`merge.node.js`): 12,000 greedy-vs-greedy games between random 30-card decks, 12 shards in parallel (about 80 s),
reporting each card's win rate when it is in the deck (+-1.4% per card) and how often it was actually played.
Usage: `balance/run-incl.sh <name> balance/proposal-1.json,balance/proposal-2.json none|... [games per shard]`.

Findings
1. **Card power is already fairly tight.** Baseline rms spread from 50% is 2.15 points; 86 of 132 cards are within
   2 points. All five proposals together only get that to about 2.0 and the 23 cards more than 3 points off to 19-20.
   Nerfing a body by one stat point moves it 1-3 points (Reckoning 53.2 -> 50.4, Obsidian Pincer 53.6 -> 52.1).
   Warcry-number tweaks are mostly invisible (Horrific Primordial 54.9 either way).
2. **Cost gradient:** cheap cards win less than expensive ones in random decks (1-cost avg 48.4%, 4-cost 51.7%,
   6-cost 52.8%, 8-cost 55%). Stats per mana at 4+ are generous; that is the main real curve skew.
3. **The bottom ten cards are a bot gap, not a balance problem.** The greedy bot never plays Bubble, Expiration,
   Ritual Sacrifice, Disabling Kick, Induce, Liquid Courage, Earthen Gem, Ethereal Mirror, Surveying Drone or
   Mass Stasis, so they are dead cards in the deck (about 45%). Making them free (probe in proposal-5) changed nothing.
   `evaluate` values a card in hand at 1.5 and has no value for disabled minions, delayed destroys, spare energy
   or Rush, so each play looks like a loss. **Do not buff those cards on this evidence; proposal-4's cost cuts
   for them (CORE_049, 068, 084, 114, 074, 123, 043, 094, 113, 087) are unverified, treat them as optional.**
4. `balance/greedy-bot-eval.patch` (not applied) teaches the bot: disabled or doomed minions are worth less, each
   energy slot is worth 2, Bubble is worth 3, Rush is worth more with more attack. Effect on the same card pool:
   Bubble 0% -> 50% played (45.7 -> 48.5 win), Expiration 0 -> 51% (48.5), Kick 0 -> 49% (46.8), Mass Stasis 0 -> 48%,
   Earthen Gem 0 -> 45% (47.9), Liquid Courage 0 -> 47%. Still never played: Surveying Drone, Induce, Ritual
   Sacrifice, Ethereal Mirror (their value is card-neutral or needs a demonic minion; needs a special case or a
   cantrip rewrite). Apply with `git apply balance/greedy-bot-eval.patch` (re-run `npm run tune` afterwards).
5. **First player wins 53-55%** in random-deck play even with the second player's bonus card. Not tested further;
   a second bonus (draw a card on turn 1, or a cheaper bonus card) is the obvious lever and is a rules call.

Files: proposal-4 (33 cards: trims the top, plus the optional cost cuts named in finding 3), proposal-5 (further body nerfs: Horrific
Primordial 6/4, Obsidian Pincer 4/4, Depths Organism 5c 4/5, Reckoning 3/2, Scholar's Desk 4c, Volcanic
Primordial 6/5; its CORE_068/096/049/113 entries are PROBES, delete them before adopting).

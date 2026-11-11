# Rules: your answers

These are the open design questions from [RULES.md](RULES.md) section 12. Fill this in and tell
me when you're done. I'll fold your answers into `RULES.md` and start Milestone 1b (the engine).

**How to answer:** for each question, tick one box (put an `x` between the brackets) and add notes
if you override. You don't have to answer in order, and you can leave a question blank to mean
"accept the default".

## Quick option

- [ ] **Accept ALL defaults** (you can still override individual questions below; an override wins)

---

## Scope and fidelity

### Q1. Classes and hero skills in v1?
All cards are classless today, and only one class was ever playable in `hsclone`. There are 9 hero
skills (2 energy, once per turn) and 9 heroes in the data.
**Default:** no classes in v1. Hero skills come in Milestone 5.

- [x] Accept default
- [ ] Override:

> 

### Q2. First-release card pool
**Default:** CORE only (132 cards, 109 of which have working reference code). PRIME (254) and heroes later.

- [x] Accept default
- [ ] Override:

> 

### Q3. Opening hands
hsclone: the first player draws 3. The second player draws 4 **and** gets "The Orb" (+1 energy, this
turn only). Mulligan code exists but is off.
**Default:** keep that. Mulligan later.

- [x] Accept default
- [ ] Override:

> what is the mulligan? i forget

> **Claude:** A mulligan is an optional redraw at the very start of a game. After the opening hand is dealt,
> a player can pick cards they don't want and swap them for fresh ones from their deck, once, before the
> first turn. hsclone has the code, but it's switched off, so opening hands are just dealt with no choice
> (and it has a bug: kept cards stay in the deck too, so they'd show up twice). "Mulligan later" means we skip
> it in v1 and can add it as an optional pre-game step. Your tick on the default stands.

---

## Core rules

### Q4. Energy
**Default:** +1 per turn up to a max of 10, costs always enforced. "The Orb" gives temporary energy
that is not lost when you spend.

- [x] Accept default
- [ ] Override:

> 

### Q5. Drawing into a full hand (10 cards)
hsclone burns the top card at turn start, but silently drops cards drawn by effects (they stay in the deck).
**Default:** a card drawn into a full hand is burned, in both cases.

- [x] Accept default
- [ ] Override:

> 

### Q6. Fatigue (drawing from an empty deck)
hsclone effectively has none (a bug makes it deal 0).
**Default:** escalating damage on each empty-deck draw (1, then 2, then 3...).

- [x] Accept default
- [ ] Override (e.g. no fatigue, or a different amount):

> 

### Q7. Board limit
**Default:** 7 minions per side, enforced by the engine. A summon into a full board just fizzles.

- [x] Accept default
- [ ] Override:

> 

### Q8. Both heroes reach 0 at the same time
**Default:** the game is a draw. No turn timer in v1.

- [x] Accept default
- [ ] Override:

> 

### Q9. Weapons
**Default:** the hero has no attack of its own. A weapon gives attack and durability, with one weapon
attack per turn. Attacking a minion with a weapon means the hero takes that minion's counter-damage (as
hsclone does). The weapon's own attack value is the only attack number.

- [x] Accept default
- [ ] Override:

> 

---

## Combat semantics

### Q10. Where does Guard apply?
Guard = "only these minions can be attacked". In hsclone it restricts minion attacks and weapon-vs-hero
attacks, but not spells (by accident), and the weapon-vs-minion check is commented out.
**Default:** Guard restricts **attacks** only (minion and weapon), not spells, warcries or skills.

- [x] Accept default
- [ ] Override (e.g. Guard also blocks spells):

> 

### Q11. What does "Rush" mean?
In hsclone, Rush lets a minion attack **immediately** and it can hit the hero (like a Charge keyword).
A "minions only" variant is possible instead.
**Default:** keep hsclone's behaviour (can attack immediately, including the hero).

- [x] Accept default
- [ ] Override (e.g. Rush = can attack minions only on the turn it's played):

> 

### Q12. Double attack
hsclone's "Onslaught" gives two attacks per turn, but is only ever set by spells. 9 PRIME cards and
2 CORE cards have `%DOUBLE_ATTACK%`.
**Default:** `%DOUBLE_ATTACK%` means two attacks per turn.

- [x] Accept default
- [ ] Override:

> 

### Q13. Bubble
In hsclone, Bubble absorbs one attack-hit, but not spell damage.
**Default:** Bubble absorbs the first instance of damage from **any** source.

- [x] Accept default
- [ ] Override:

> 

### Q14. Hero armor
In hsclone, armor absorbs attack damage only, and spells hit health directly.
**Default:** armor absorbs all damage, including spells.

- [x] Accept default
- [ ] Override:

> 

### Q15. Damage and death order
**Default:** damage is simultaneous. After each action the engine removes dead minions in play order, then
fires any death effects. (hsclone removes them from the browser after 900 ms.)

- [x] Accept default
- [ ] Override:

> 

### Q16. Spell damage bonus
hsclone's bonus also scales heals, shields and draw counts (a bug).
**Default:** the bonus only increases damage numbers.

- [x] Accept default
- [ ] Override:

> this is a big maybe: change damage to enhancement (or synonym word) that can increase heals also? not sure tho

> **Claude:** Recorded as **provisional**. I'll build the bonus as a per-effect-kind setting (damage on, heals off
> for now) so flipping it to "damage + healing" later is a one-line change plus a test. Possible names if you go
> broader: Spell Power, Enhancement, Potency. One thing I'd rule out whichever way you go: it shouldn't scale card
> draws or shields (hsclone did that by accident).

### Q17. Disable
hsclone: a disabled minion loses exactly one of its owner's attack opportunities (not live-verified).
**Default:** "cannot attack during its owner's next turn".

- [x] Accept default
- [ ] Override:

> 

### Q18. Expiration (CORE_114 "Cryptic Curse")
hsclone ticks the countdown on both boards at every turn start, and one of its loops kills the wrong
board. **I can't pick a default that I'm confident matches your intent.**
Proposed: the target dies at the start of the caster's next turn.

- [x] Accept proposed
- [ ] Override (what should it do?):

> 

### Q19. Hidden / concealed
In hsclone, only one token uses it, and it's excluded from some (not all) targeting.
**Default:** a hidden minion can't be targeted by anything until it attacks.

- [x] Accept default
- [ ] Override:

> 

---

## Cards and text

### Q20. When card text and hsclone's behaviour disagree
About 19 CORE cards are listed in RULES.md Appendix A (for example: text says "+1 HP", code gives +1
attack; text says "2 random enemies", code hits one).
**Default:** the printed text is authoritative unless you say otherwise. We'll settle each card with a
test during Milestone 4.

- [x] Accept default
- [ ] Override (e.g. "hsclone's behaviour is what I wanted for these": list the cards):

> 

### Q21. Triggers (events, on-death, end-of-turn, combo, secrets)
hsclone has no code for these, but PRIME depends on them heavily, and CORE cards 071, 085 and 130 need an event.
**Default:** design a general trigger system into the engine from the start, even though only a few CORE
cards need it at first.

- [x] Accept default
- [ ] Override:

> 

### Q22. Data-driven effects or per-card code?
Can the card data alone (`playType`, `playContext`, mechanics, numbers) describe effects, or do cards
need their own code like in hsclone? I don't know yet. I'd check how many of the 132 CORE cards the data
can fully describe at the start of 1b.
**Default:** a hybrid: data-described effects for the common verbs (damage, heal, draw, summon, buff...),
small per-card scripts for the odd ones.

- [x] Accept default
- [ ] Override:

> 

---

## Data

### Q23. What the number fields mean
**Default:** `numberPrimary` = the main amount; `numberSecondary` = the second amount (e.g. health in a
+X/+Y buff); `numberRNG` (CORE) and `numberRandom` (PRIME) = how many random targets. Please confirm,
especially the cards where primary is 0 and secondary holds the amount (for example, a heal card).

- [x] Accept default
- [ ] Override / corrections:

> might need to revisit this to really figure it out. i honestly cant remember

> **Claude:** Recorded as **provisional**. The loader will keep the raw number fields untouched and read them through
> named accessors, plus a test that each card's printed text matches the number the engine uses. That way we can
> work out the odd cases card by card in Milestone 4 instead of guessing now.

### Q24. Nameless and inactive PRIME cards
22 PRIME cards are inactive (all nameless) and 29 active ones have no name. This only matters once PRIME is in scope.
**Default:** ignore for now.

- [x] Accept default
- [ ] Override:

> 

---

## Anything else

### Things I got wrong or missed
If something in `RULES.md` doesn't match how you remember `hsclone` or how you want the game to work,
say so here.

> nothing stood out egregiously wrong. its a huge complex game and from three/four years ago. so it may jog my memory as we go along

### Rules or features you want that aren't mentioned anywhere
> see previous answer. cant recall now. revisit as we go

### Card-by-card notes (optional)
Any specific cards you want changed, cut or redesigned (you can list ids or names).

> 

# PRIME distance audit (2026-11-12): which cards are still 1:1 with a well-known card

Same goal as the CORE pass in `README.md` ("legal distance"): no PRIME card should be a recognisable copy of a card from the game
that inspired this one. **Nothing here is applied.** Airtable is the source of truth; adopted changes must be made there and pulled.
This repo is public, so the file describes each card's *effect shape* and never names the card it resembles (see `CLAUDE.md`,
"Airtable and the `inspiration` column"). If you want the closest match for a card, ask and I will tell you in chat.

How I judged (this is recognisability, not a legal opinion): I compared effect text, cost and stats, from memory, against the
cards I know. A = effect, cost and stats are all the same (or off by one stat): change before shipping. B = same effect with different numbers
or a different body: give it a twist. C = generic (a keyword on a body, a plain buff or heal): leave, or nudge a number.
Numbers in the **Proposed** column are starting points; the simulator (`npm run sim`, `balance/run-incl.sh`) should check them once
the cards are playable.

**Built already** (marked ✔) means I wrote an engine definition before this audit; it will need redoing if the card changes.
I have paused new PRIME definitions for flagged cards until you decide.

## Summary

| Tier | Meaning |
| --- | --- |
| A | effect, cost and stats match: redesign |
| B | same effect, different body: add a twist |
| C | generic: leave |

Card names are not the concern (they are original); only the mechanics are compared.

The big structural finds, in order of how much they matter:

1. **The whole Mystery set (17 cards) is a one-for-one port** of the hidden-trap family: same triggers, same payloads, mostly the same
   cost. It is also the biggest unbuilt engine feature, so this is the cheapest moment to change it. See "Mysteries" below.
2. **Choose-one spells and bodies (111, 112, 113, 115, 120, 121, 124)** are copies of one class's whole suite, option for option.
3. **The overload family (200, 202, 203, 204, 208, 209, 213, 205)** copies one class's cheap burn and weapon; the numbers match.
4. **The enrage family (009, 022, 024, 035, 041, 244)** copies the same class's "+N attack while damaged" bodies, including the two
   famous ones (the 3-cost with extra attack and Onslaught, the 9-cost with Rush and +6).
5. **The three Giants (085, 086, 247) and the keyword-pile 8-drop (214) and the timer 9-drop (107)** are exact.
6. **Sprites** are a tribe copy (the "other X get +2 attack", "gain +1 attack when you summon one", "destroy one to gain +2/+2" trio).
7. **Many one-liner bodies are exact** (a 2/1 that draws on death, a 3/3 that summons a 2/1 on death, a 2/1 that pings 2 on death...).

> **Update 2026-11-12:** the Mystery rewrites below are applied in Airtable and built (see `RULES.md`, "Mysteries"). Decision: the opponent sees each
> face-down Mystery's *category*. 126 was changed to fire when an enemy minion attacks you (Mysteries only react on the opponent's turn).

> **Update 2026-11-12:** the choose-one, overload and enrage families are applied in Airtable and rebuilt too (see `RULES.md`, "Choose-one, overload and enrage
> rewrites"). A few numbers differ from the rows below (208, 120, 121, 024 were adjusted while building).
> The "exact bodies and warcries" table is applied and built too for everything not listed under "still to do" below (`RULES.md`, "Exact bodies and warcries").
> The Giants, 214, 107, 228, 078 and 105 are applied and built too (`RULES.md`, "The Giants, the keyword pile and friends").

## Mysteries (132, 143, 127, 152, 126, 146, 159, 148, 129, 158, 157, 156, 067; payoffs 250, 149, 045, 147)

Today each Mystery copies a hidden-trap card's trigger *and* payload. Two ways to get distance, and I suggest doing both:

- **System twist (needs your call):** give Mysteries their own identity. Option 1: every Mystery has a **Dawn** effect: if it has not
  triggered by the start of your 3rd turn after you set it, it reveals itself and does a weaker version (so a Mystery is never a dead card
  and the opponent can play around the clock, which is a decision Hearthstone-style secrets lack). Option 2: **one trigger family only
  fires on your own actions** (not only reactive traps). Option 3: Mysteries cost the opponent information differently (the opponent sees
  the *category*, e.g. "Attack / Spell / Minion", of your face-down card).
- **Card twists** (each payload moves off the original; most also reuse engine pieces I already have):

| Card | Shape today | Tier | Proposed |
| --- | --- | --- | --- |
| 143 Commissioned Armor (3) | when your hero is attacked, gain 8 armor | A | when your hero is attacked, gain Armor equal to **twice** the attacker's Attack (min 4) |
| 127 Faint Slumber (2) | next attacker returns to hand, costs 2 more | A | the next enemy minion to attack is **Disabled for 2 turns** and loses 2 Attack (the attack still happens) |
| 152 Bring the Night (5) | enemy targeted spell: summon 2/4 as new target | A | enemy targeted spell: it hits a **random minion the caster controls** instead (cost 3) |
| 126 Rage Unleashed (2) | attacked with a weapon: 2 damage to all enemies | A | when YOU attack with your weapon, also deal its Attack to a random enemy minion (a Mystery that fires on your own action) |
| 146 Black Hole (3) | enemy casts a spell: nullify it | A | when the opponent casts a spell, **add a copy to your hand** (it still resolves); cost 2 |
| 159 Confrontation (2) | next minion they play: set Health to 1 | A | next minion they play has its **Health halved** (rounded up) and is Disabled |
| 148 Watch Your Back! (3) | next enemy attacker on your hero is destroyed | B | the next enemy minion to attack your hero takes damage **equal to your hero's missing Health** |
| 129 Pit Trap (2) | after they play a minion, 4 damage to it | A | after they play a minion, deal damage **equal to its Cost** to it |
| 158 Resurrection (2) | your minion dies: return it with 1 Health | A | when your minion dies, return it to your **hand** and it costs 1 less |
| 157 The Wrong Door (1) | enemy attacks: summon a 2/1 | A | enemy attacks: summon **two 1/1 Mice with Guard** (the attack goes to a Mouse) |
| 156 Surprise, surprise! (1) | your hero takes damage: deal that much to theirs | A | when your hero takes 5 or more damage in one hit, **restore 5 Health** and draw a card |
| 132 Light the Dark (2) | remove Concealed from all, destroy enemy Mystery | A | **reveal** every Concealed minion (it loses Concealed and takes 1 damage) and destroy the enemy Mystery; draw only if one was destroyed |
| 067 Android Infiltrator (4) | warcry: destroy the enemy Mystery | B | warcry: **take** the enemy's Mystery (it becomes yours, face down) |
| 250 / 149 | end of turn with a Mystery: buff | C | leave (they depend on the Mystery system, which is the point) |
| 045 / 147 | gain on Mystery played / next Mystery costs 0 | C | leave |

## Choose-one, burn and weapons (class suites)

| Card | Shape today | Tier | Proposed |
| --- | --- | --- | --- |
| 111 Untamed Potential (2) | +1/+1 to all yours, or summon a 3/2 | A | +1/+1 to your **Creatures**, or summon a 3/2 and **give it Rush** (cost 3); needs the 3/2 token created in Airtable |
| 112 Night Breeze (2) | 3 damage, or 1 damage and draw | A | 2 damage and **gain 2 Armor**, or 1 damage and draw (cost 2) |
| 113 Spring Spell (3) | +4 Attack, or +4 Health and Guard | A | +3 Attack and **Rush**, or +3 Health and Guard and **heal 3** |
| 120 Shamanic Rage (5) | 5 damage, or 2 to all enemy minions | A | 4 damage to a minion **and 1 to its neighbours**, or 1 damage to all enemy minions **and Disable them** (cost 6) |
| 121 Sanctity (6) | +2 energy slots, or draw 3 | A | +1 energy slot **and draw 1**, or draw 2 **and give your hand -1 cost this turn** (cost 5) |
| 123 Maven of Renewed Spirit (7) | draw 2, or heal 5 | B | draw 2 and take 2 damage, or heal 5 **and give a friendly minion Bubble** |
| 115 Kangrinboqe Warrior (6) | Rush, or +2 Health and Guard (4/4) | A | 5/3: gain Rush **and +1 Attack**, or +3 Health and Guard |
| 124 Forest Protector (7) | +5 Attack, or +5 Health and Guard (5/5) | A | 4/6: **+3 Attack and Rush** or +3 Health, Guard and **restore your hero 3** |
| 119 Maven of Lost Souls (5) | 2 damage, or silence a minion (2/1) | A | 2/3: deal 2 damage to a **damaged** minion, or Suppress a minion **and give it -1 Attack** |
| 203 Flash Strike (1) | 3 damage, overload 1 | A | 3 damage to a **minion**, overload 1 and **draw a card if it dies** (cost 2) |
| 208 Ionic Incineration (3) | 5 damage, overload 2 | A | 5 damage **split as 3 to the target and 2 to its neighbours**, overload 2 |
| 209 Blaze Storm (3) | 2 damage to all enemies, overload 3 | B | 2 damage to all enemy **minions**, overload 2, **Disable the survivors with 1 Health** |
| 202 Divine Force (1) | 2 damage to 2 random enemies, overload 2 | B | 3 damage to ONE random enemy, overload 1 |
| 204 Frosted Sword (2) | 2/3 weapon, overload 1 | A | 2/2 weapon that **Disables the enemy it hits**, overload 1 |
| 200 Molten Golem (1) | 3/1 Onslaught, overload 2 | B | 2/1 Onslaught, overload 1, **dies at end of turn if it attacked twice** (a real cost) |
| 213 Lava Titan (5) | 7/8 Guard, overload 3 | B | 6/7 Guard, overload 3, **heals you 1 per attack taken** |
| 205 Nature's Fury (3) | +1/+1 per overload card you play | B | +1/+1 per overload card, and **Overcharge counts played by either player** |

## Enrage family

| Card | Shape today | Tier | Proposed |
| --- | --- | --- | --- |
| 009 Enraged Slug (2) | 2/3, +3 Attack if damaged | A | 1/4, +2 Attack and **Rush** if damaged |
| 035 Mad Slayer (5) | 2/6, +2 Attack while damaged | B | 3/6, **+1 Attack per damage taken** (max +4) |
| 041 Crazy Imp (1) | 0/2, +5 Attack if damaged | A | 1/2, **gain +1 Attack each time it is damaged** (stays) |
| 024 Deep Diver (3) | 2/3 Guard, +3 Attack if damaged | B | 2/4 Guard, **+2 Health instead of Attack** when damaged once |
| 244 The DragonMancer (9) | 3/8 Rush, +6 Attack if damaged | A | 4/8 Rush, **Onslaught while damaged**, no Attack bonus |
| 022 Blood-crazed Assassin (3) | 3/3, +1 Attack and Onslaught if damaged | A | 3/3: **Onslaught only on turns your hero took damage** |
| 006 Swiftpack (1) | 2/1, Rush if you have a weapon | A | 1/2, Rush **and +1 Attack** while you have a weapon, loses it when it breaks (already) |

## The Giants, the keyword pile, the timer

| Card | Shape today | Tier | Proposed |
| --- | --- | --- | --- |
| 085 Bark Creature (10, 8/8) | costs 1 less per other minion | A | costs 1 less per **minion that has died this game** (both sides, max 6) |
| 086 Spider Mech (12, 8/8) | costs 1 less per other card in hand | A | costs 1 less per **card you have played this turn and last**, max 6 (a combo cost, not a hand-size cost) |
| 247 Volcanic Giant (20, 8/8) | costs 1 less per damage your hero took | A | costs 1 less per **Armor you have spent** this game (damage taken by Armor), start 12 |
| 214 Spirit of the Night (8, 3/5) | Onslaught, Rush, Bubble, Guard | A | 5/5 Guard and Bubble, **and your other minions have Rush** (the four-keyword pile is the problem, not the body) |
| 107 Cronus (9, 8/8) | players only have 15s per turn | A | 8/8: **both players' turns are 45s while it lives** (and it does nothing if you have no timer); or drop the timer and make it "the opponent's turns are cut to 30s, yours stay 60s" (also needs the unbuilt timer) |
| 228 The Sorcerer's Stone (8) | destroy all minions | A | destroy **all minions with 4 or more Attack**, then **both** players draw a card; cost 6 |
| 078 Infernal Nest (2, 0/7) | destroys the board at the start of your next turn | A | **7 Health, no Attack: at the start of your next turn it deals 4 damage to ALL minions** (the nest dies too) |
| 105 Nightmare (9, 10/5) | set a hero's health to 15 | B | set **both** heroes to 18 |

## Exact bodies and warcries

| Card | Shape today | Tier | Proposed |
| --- | --- | --- | --- |
| 013 Ploofer (2, 2/1) | demise: draw | A | 1/3 for 2, demise: draw a card (a sturdier body, so it no longer matches the stat line) |
| 019 Phatcat Warrior (3, 2/3) | demise: summon a 2/1 | A | 2/3: demise summons a Warrior Bot that **has Rush** (edit the token in Airtable) |
| 004 Soul Miner (1, 1/1) | demise: 2 damage to enemy hero | A | demise: 2 damage to **a random enemy minion** (or hero if none) |
| 007 Camocrab (1, 2/1) | Concealed | A | 1/3 Concealed |
| 040 Slick Naga (6, 4/5) | Onslaught | A | 4/4 Onslaught, **loses it when damaged** |
| 060 Poisoned Imp (3, 2/3) | Touch of Death | A | 1/3 Touch of Death, **Concealed** |
| 017 Feline Fisherman (3, 3/3) | warcry: heal 3 | A | 3/3 warcry: **heal 3 or deal 1 damage** (two options) or: heal all friendly characters 1 |
| 020 Magic Mushroom (3, 2/1) | warcry: Suppress | A | 2/2 warcry: Suppress a minion **with Cost 3 or less** |
| 032 Siren (4, 4/3) | warcry: Suppress | A | warcry: Suppress an **enemy** minion and **draw a card if it had a warcry or a demise** |
| 048 Invoked Shaman (2, 2/2) | warcry: swap Attack and Health | A | warcry: **swap the Attack and Health of two minions of your choice** (cost 3) |
| 082 Foxy Huntsman (5, 4/2) | warcry: destroy a minion with 7+ Attack | A | 4/3: destroy a minion with **Attack 6+ that has attacked this turn or is damaged** |
| 095 The Inquisitor (5, 5/4) | warcry: destroy enemy weapon, draw its Durability | A | 4/5: destroy the enemy weapon and **gain its Attack as armor**; or **steal it** (equip it) |
| 161 Enigmatic Courier (3, 3/3) | warcry: set a minion's Attack to 1 | B | 2/3: **a minion loses half its Attack**, rounded up |
| 028 / 002 (4 / 1) | give a minion +2 Attack this turn | B | 028: **+3 Attack and Rush** this turn; 002: a friendly minion only, +2 Attack, and it takes 1 damage |
| 224 Takeover (6) | destroy a minion, restore 3 to your hero | A | destroy a minion and **summon a 2/2 of the same Race for you** (heal dropped) |
| 241 Outer Beam (3) | damage to a minion equal to your Armor | A | damage equal to your **Armor, then lose half the Armor** (rounded up) |
| 233 Battle Shield (2) | +3/+3 to a damaged minion | A | +2/+4 to a damaged minion and **it heals 2** |
| 185 Into the Shadows (1) | return a friendly minion, its cost -2 | A | return a friendly minion, **it costs 1 less, and gains Rush when replayed** |
| 063 Seadog Captain (4, 3/3) | if opponent has 4+ minions, take control of one | A | take control of an enemy minion **with 2 or less Attack**; it returns at the **end of the turn** |
| 179 Malevolent Cephalopod (4) | control a minion of 3 or less Attack until end of turn | A | **until the end of your next turn**, and it must attack |
| 246 The Chaos Knight (7, 4/5) | demise: steal a random enemy minion | A | demise: **trade** your weakest minion for the opponent's strongest |
| 183 Data-Mage (6, 4/5) | warcry: take control of a minion with 2 or less Attack | B | take control of a minion **for 2 turns** |
| 251 Conquest and Glory (10) | steal 2 random minions; demise: Glory | C | leave |
| 169 Paladin of the Shattered Mirror (8, 6/6) | Bubble, Guard, demise: equip a 5/3 weapon | A | 6/6 Bubble, Guard, demise: **gain 5 Armor and equip a 3/2 weapon** (the weapon token must exist in Airtable) |
| 070 Rusted Warden (5, 4/4) | Guard, demise: 2 damage to everyone | A | 4/4 Guard, demise: **2 damage to all enemy characters and give your minions Bubble** |
| 184 The Sorceress (7, 7/7) | double your spell/ability output | A | 5/7: your spells deal **+1 damage and heal +1** (Spell Damage that also covers healing) |
| 176 Shaman Wudu (2, 0/5) | heal a random friendly damaged minion 3 at end of turn | A | at end of your turn, heal the **most damaged** friendly minion 2 and **give it +1 Attack until your next turn** |
| 237 Spellsmith (2, 1/4) | gain 1 Armor when a friendly minion takes damage | A | **gain 2 Armor whenever a friendly minion dies** |
| 043 Tra'an Guard (1, 1/2) | gain +2 Attack when any character is healed | A | **gain +1/+1** when **your** characters are healed (bigger body, only your own) |
| 239 Desert Rider (3, 2/4) | gain +1 Attack when any minion takes damage | A | gain +1 Attack when an **enemy** minion takes damage, **resets** on your turn start |
| 049 Fiery Axe Thrower (2, 1/1) | after you summon a minion, 1 damage to a random enemy | A | after you summon a minion, 1 damage to a random enemy **minion**, **only the first time each turn** and 2/2 |
| 055 Suicidal Wizard (2, 3/2) | after you cast a spell, 1 damage to ALL minions | A | 2/3: after you cast a spell, 1 damage to **all enemy minions** (it no longer hurts your own board) |
| 141 Fierce Gremlin (2, 1/3) | gain +1 Attack when you cast a spell | A | gain +1 Attack **until end of turn** for each spell, and **draw if it reaches 4** |
| 104 Perses (5, 5/5) | +1/+1 at the end of each turn | A | +1/+1 at the end of **each of your turns**, **and -1/-1 if it did not attack** |
| 142 Demon Sorcerer (2, 3/2) | your spells cost 1 less | A | your spells cost 1 less, **but your hero takes 1 damage when you cast one** |
| 220 Ancient Portal (5, 0/4) | your minions cost 2 less, min 1 | A | your minions **that cost 4 or more** cost 2 less (min 3) |
| 196 Soul Lantern (0) | next spell this turn costs 2 less | A | next spell this turn costs 2 less **and draws a card** (cost 1) |
| 211 Warpipe (3) | draw a card; it costs 3 less | B | leave (cantrip); or draw 2, **the cheaper costs 2 less** |

## Sprite tribe

| Card | Shape today | Tier | Proposed |
| --- | --- | --- | --- |
| 080 Brave Sprite (3, 3/3) | other Sprites have +2 Attack | A | **whenever you summon a Sprite, give it +2 Attack this turn and Rush** |
| 044 Mutating Sprite (1, 1/2) | +1 Attack whenever you summon a Sprite | A | **+1/+1 whenever a Sprite dies** |
| 077 Phantom Spider (1, 1/2) | destroy a Sprite, gain +2/+2 | A | **destroy a friendly Sprite and gain its stats** |
| 058 Sod Frog (3, 2/3) | give other Sprites +2 Health | B | give your Sprites **+1/+1 and Bubble** |

## Spell-cast, summon and card-count bodies (mostly B or C)

| Card | Tier | Proposed |
| --- | --- | --- |
| 073 Wandering Mystic (6): draw when you cast a spell | B | draw when you cast a spell **that costs 3 or more** |
| 069 Spider King (4): summon a 1/1 on spell | C | leave |
| 076 Spellwolf (8): +2/+2 per spell | C | leave |
| 050 Crazed Imp (2): +2 Attack this turn if you cast a spell | B | leave |
| 064 Cultist Acolyte (3): +1/+1 per card played | B | per card **the opponent** plays |
| 154 Amaad (7): add a random card on each play, costs 4 less | C | leave |
| 093 Cleric of Shaho (3): heal 2 on summon | B | heal 2 **to your most damaged character** |
| 027 Soul Collector (4): draw when a minion dies | B | draw when **your** minion dies, **once per turn** |
| 018 Mad Demon (3): +1 Attack per death | B | +1 Attack when **an enemy** minion dies |
| 128 Bottomfeeder Crab (2): +2/+1 per friendly Creature death | C | leave |
| 016 Barracks (3): draw when damaged | B | draw the **second** time it takes damage each turn... or leave |
| 210 Well of Infinite Tidings (3): draw at end of turn | C | leave (a fresh shape) |
| 140 Tome of Spells (1): add a random spell | A | add a random spell **of cost 3 or less** and **put it into the hand with +1 cost** |

## Not flagged (C): leave as they are

Plain keyword bodies (003, 005, 008, 021, 025, 030, 031, 033, 036, 047, 072, 074, 075), and fresh shapes (056, 062, 078's
replacement, 088, 089, 092, 096, 097, 098, 100, 114, 116, 136, 137, 160, 165, 167, 170, 171, 172, 174, 175, 178, 180, 186, 187, 190,
194, 201, 206, 216, 218, 219, 221, 223, 227, 231, 234, 238, 242, 245, 248, 249, 250, 252, 253, 254, 057, 037, 084, 091, 151, 155,
229).

012 Bare Boned (3/2 for 2, "cannot be targeted by spells, items or skills") is an exact body (tier A): make it **2/3 for 2**.

## What I need from you

1. **Mysteries:** pick the system twist (Dawn effect, own-action triggers, or category reveal) before I build them, or tell me to
   keep them as proposed per card and do the system twist later.
2. **Tiers:** do you want the A tier all rewritten in Airtable first, or should I start with the structural families (Mysteries,
   choose-one, overload, enrage, Giants)?
3. **Cards I already built** (about 110 of the above) will need their definitions changed when the text changes; I will do that, with tests,
   right after the Airtable edits are pulled.
4. Some proposals above are sketches (Spirit of the Night, 032, 055, 224) where I flagged my own doubt in the row: treat those as
   "needs a better idea" rather than final.

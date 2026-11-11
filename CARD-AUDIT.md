# Card audit (2026-11-10)

Read-only review of `data/setsCore.json` (69 core cards) against the game code, plus a
pass over the card art in `public/images/sets/SET_CORE/`. Nothing in the data or code was
changed. Card data is generated from Airtable (`npm run airtable`), so any card edits
below should be made there, not hand-edited in the JSON.

Method and limits: implementation coverage comes from reading the code and grepping for
card keys, not from playing every card. Items marked *(verify)* should be confirmed in-game
before acting. Balance comments are from the numbers only; none of this has been playtested.

## 1. Legacy Hearthstone-style cards

These come from the original Hearthstone-style version of the game and were never ported
to the zone/SNAP-style rules. They are not "missing features". The question is whether to
cut or redesign each one.

| Card | Mechanic | Notes |
| --- | --- | --- |
| 117 Forgotten Guardian (1c, 3/1) | Bulwark | Bulwark is taunt-like; has no clear meaning with zones |
| 030 Obsidian Pincer (5c, 5/4) | Bulwark | |
| 028 Fallen Angel (6c, 6/5) | Bulwark | |
| 052 Earthen Primordial (8c, 8/8) | Bulwark | The only 8-cost with a unique role |
| 046 Nature's Honey (2c item) | Buff + Bulwark | Currently does nothing: the buff stage has no case for it *(verify)* |
| 024 Logrund's Protector (4c, 3/5) | Armor | |
| 027 Mageman (6c, 4/6) | Spell Damage | |
| 045 Succubus (1c, 1/1) | Choose One | No handler; the on-play does nothing *(verify)* |

Related dead code: `determine-on-play-global-mechanic.ts` logs `@todo` for Bulwark, Heal,
SetValue, SpellDamage, Silence and Transform. These are stubs for the old design and could
be deleted. `app.config.ts` also has ~35 `mechanics` toggles, mostly `false`; if they are
also legacy flags, they could be removed (not verified whether anything reads them).

Decision for you: for each card above, cut, or redesign as a zone-style effect. Examples
that fit the SNAP style: Bulwark could become "this zone can't be targeted by..." or
"+X power if you have the most cards here". The 4 Bulwark cards are the biggest group, so
one replacement design could cover all of them.

## 2. Working cards the bot plays wrongly

Separate from the legacy list: these cards work when a human plays them, but the bot's play
path (`aiPlayCardMove`) has no case for them, so the bot places the body and the ability
never fires. This is in addition to the `if (cardIndex)` bug (index 0 skips every ability).

002 Cheeky Pharaoh, 003 Skullkid Shaman, 014 Faceless Gargler, 026 Little Conjurer,
034 Invoke, 038 Immolation, 040 Sanctuary, 118 Tidal Primordial, 123 Liquid Courage,
124 Blast!, 125 Erratic Blitz, 129 Ray Shield.

Fixed properly by unifying the two play paths (see `ROADMAP.md`, Milestone 3.5).

Also: 010 Sod Frog says "your other Sprites here have +2 power", but it uses the generic
boon handler, which doesn't appear to check race, so it likely buffs every other minion
*(verify)*.

## 3. Balance observations (numbers only)

Context from the code: AP total goes up by 1 each game turn (cap 10), the game is 12
turns, and hands/decks are 10/30.

Vanilla minions (no ability), stat total by cost:

| Cost | Cards | Stat total |
| --- | --- | --- |
| 0 | Wee Sprite 1/1 | 2 |
| 1 | Nute Sprite 2/2 | 4 |
| 2 | Wanderlands Hound 3/2, Micro Skelly 2/3 | 5 |
| 3 | Brute Sprite 5/3 | 8 |
| 4 | Depths Organism 4/5, Hornhat Warrior 2/7, Tribal Warrior 3/6 | 9 |
| 5 | Blood-starved Beast 6/5 | 11 |
| 6 | Wandering Blobber 8/5 | 13 |
| 8 | Core Elemental 10/4 | 14 |

Roughly +2 total stats per cost with a jump at 3. Things that stand out:

- **Brute Sprite (3c, 5/3)** is 3 stats above the curve; a 3-cost body that is as big as
  most 4-costs.
- **Messenger of the Earth (3c, 8/4, mythic)** has 12 stats for 3 AP. The drawback
  (discard your most expensive card) is weak early, since your hand is usually cheap then.
  Probably the strongest card in the set.
- **Tidal Primordial (2c, 5/3)** has 8 stats for 2 AP, with a random discard as the drawback.
- **Cheeky Pharaoh (0c, 4/2)** is a 6-stat 0-drop with a minor drawback (-1 power to your
  other cards in the zone). Compare with Wee Sprite 1/1.
- **Henry (1c, 0/4, mythic)** adds a random mythic minion to your hand. Only 4 cards are
  mythic, and one of them (Messenger) is the best body in the set, so this is very strong
  card advantage.
- **Destroy Random (3c)** is strictly worse than **Destroy (3c)**: same cost, same type,
  but random instead of chosen. No reason to ever play it. Make it cheaper (1-2c) or
  stronger (e.g. destroy two random).
- **Knife Attack (1c, 2 dmg)** is more efficient than **Mindmelt (3c, 4 dmg)**: 2 damage
  per AP vs 1.33.
- **Blast! (1c, 1 dmg to all minions)** vs **Immolation (2c, 2 dmg to all enemy minions)**:
  Immolation is a one-sided, bigger effect for 1 more AP. Blast! can only pay off when you
  have fewer minions in play.
- **Sanctuary (7c, draw 4)** looks overcosted; with a 10-card hand cap and 1 draw per turn
  it needs a very full-empty hand to be good, and 7 AP is a whole late turn.
- **Cost curve:** 4 / 13 / 11 / 13 / 14 / 4 / 5 / 3 / 2 for costs 0-8. Nothing at 5+
  is common; if the game really has 12 turns with AP growing each turn, the top end may be
  underused. Worth checking with the simulator (ROADMAP Milestone 3).
- **Stat distribution:** 32 cards have 1 health, and 26 have 0 power. Expected for spells
  (they carry placeholder 0/1 stats), but it means the 48 minions are what actually drive
  the board.

All of these are hypotheses. The self-play simulator (Milestone 3) is the way to test them.

## 4. Naming and text

- **Duplicate name:** two cards are called "Logrund's Protector" (008: 3c 1/3, gains power
  when you play a minion; and 024: 4c 3/5, armor). Rename one. The flavor text on 024
  ("Logrund. Low ground.") suggests 024 is the original.
- **Placeholder-style names** that are just the mechanic: 041 Destroy Random, 043 Destroy,
  056 Debuff, 124 Blast!, 044 Aquashards (mostly fine). Good candidates for real names
  and flavor text. Only 6 of 69 cards have flavor text.
- **Likely typos:** 013 "Pumpkin' Tree" (Pumpkin'?), 085 "Ifriit Ward" (Ifrit?), 110 "The Left
  Hand Of Chaos" (capital "Of" is inconsistent with other titles).
- **Text typos:** 034 Invoke has a double space and "for the this turn only"; 037 Earthen
  Gem has a double space; 041 and 043 end "...Removes it from battle" with no punctuation.
- **Inconsistent verbs:** damage is "Attack ALL minions for 1 damage" (124), "Attack 2
  random enemy minions for 2 damage" (125), and "Deal X damage" everywhere else. Pick one.
- **Singular/plural:** 036 "Call Reinforcement" summons one minion.
- **Naming families that work:** the "Primordial" cycle (Ethereal, Draconic, Horrific,
  Tidal, Volcanic, Earthen) and "Sprite" cards. 023 Core Elemental could join the cycle.

## 5. Art vs. cards

I viewed all 69 `*-CARD.jpg` images against name, type and text. Every card has CARD, DECK
and MINION art; there are no missing files. Two extra art sets (035, 132) don't match any
core card.

Art that doesn't match the card:

- **126 Obliterate** (a minion): the art is a green slug-like creature on a cutting board
  with a knife. It reads as a creature called something like "Meat Slug"; neither the name nor
  the effect ("destroy an already damaged minion") fits.
- **129 Ray Shield**: art is a glowing planet over a field. There is no shield.
- **027 Mageman**: art is a hooded, cloaked rogue-type figure, not a mage.
- **041 Destroy Random vs 043 Destroy**: near-identical fiery-explosion art, so the two cards
  are hard to tell apart at a glance.
- **053 Knife Attack**: a kitchen-knife product-style image, noticeably different in style from
  the rest of the set.
- **008 Logrund's Protector**: a giant sword in a volcanic landscape, with no character, while
  024 (the other Logrund's Protector) is a dwarf.
- **016 Brute Sprite** and **015 Nute Sprite**: Sprite-race cards, but the art shows a spiked
  frog/turtle and a small blue dragon respectively. Fine if "Sprite" is a loose family.

Style consistency: the set mixes at least 3 looks: cartoon/painterly (e.g. 001, 010, 014),
semi-realistic fantasy illustration (e.g. 082, 085, 120), and photo-like or concept
art (e.g. 031, 032, 033, 053, 036). A unified art direction would matter for a shipped game.

## 6. Art provenance (matters for monetization)

I can't tell from the images where any art came from, so this is only about the data fields:

- 56 of 69 cards have `artistName`/`artistUrl`. 35 of them credit "Rexard" (which is
  a commercial asset-pack seller, so check that licence covers commercial use in a
  shipped game).
- 13 cards have **no** artist credit: 031 Creature Tamer, 034 Invoke, 036 Call
  Reinforcement, 041 Destroy Random, 043 Destroy, 053 Knife Attack, 056 Debuff, 058 Focus
  Shot, 060 Fire for Effect, 082 Knight Lieutenant, 108 Commander's Idol, 112 Horrific
  Primordial, 120 Mindmelt. Only 036 has `fpoArt: true`.
- Several of the credited artists differ (about 20 distinct names). Each needs a licence
  that allows commercial use, or the art needs replacing before launch.

Suggested next step: build a small table of card, artist, source, licence, and status
(free for commercial use / needs purchase / placeholder to replace).

## 7. Suggested next steps

1. Decide what to do with the legacy cards (section 1). This shapes the roadmap more than
   anything else here.
2. Rename the duplicate "Logrund's Protector" and fix the typos (cheap; do it in Airtable).
3. Rebalance a few clear outliers after the simulator exists (Messenger, Brute Sprite,
   Destroy Random).
4. Start an art-provenance table before any public launch.

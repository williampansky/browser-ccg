# Mechanics audit: tags the card text names but the Airtable `mechanics` array lacks

The card detail window ("overlay") now lists **exactly the entries in a card's Airtable `mechanics` array** (in order, nothing hidden, nothing added
from the card text). So a card whose text names a mechanic that is not in its array will not show it there. This file lists those cards (every
active, named card, as of the Airtable pull on 2026-11-15) so each can be decided.

Many are probably fine: a card that **gives** a keyword to another minion, **summons** something that has it, or **destroys** something with it does not
have that keyword itself, so it should not be tagged. The tag means "this card does / has this", not "the text contains the word".

## How to fill it out

For each row in "To decide", write in **Verdict**: `add` (put the mentioned tag in the array in Airtable), `leave` (the array is right as it is), or
`other` (say what in Notes). Then tell me and I will apply it (or edit Airtable yourself and pull). Things to check before adding a tag:

- **Does the engine read it?** Only a few tags change how a card plays: the keywords on a minion (`BULWARK`, `RUSH`, `BUBBLE`, `DOUBLE_ATTACK`, `HIDDEN`, `NO_ATTACK`),
  `OVERLOAD`, and "needs a hand-written definition" (any tag that is not a plain keyword). Adding a **keyword** tag such as Guard, Stampede (Rush), Bubble or
  Concealed (Hidden) to a card **gives that minion the keyword in the game**. Do not add those to a card that only grants or destroys them.
- **Starter decks** read some tags to pick cards (for example the Swarm deck prefers `SUMMON` and `ON_DEATH`), so an added tag can change a generated deck.
- The glossary names differ from the symbols: Guard = `BULWARK`, Stampede = `RUSH`, Onslaught = `DOUBLE_ATTACK`, Concealed = `HIDDEN`, Action Point = `ENERGY`.

## Settled

| Card | Name | Text | Text names (not in array) | Array now | Conclusion |
| --- | --- | --- | --- | --- | --- |
| CORE_061 | Ancient Raptor | Draw a card anytime you Summon a Creature | Summon | Event, Draw Card | **Leave as is** (`EVENT`, `DRAW_CARD`). The Raptor reacts to summons, it does not summon: `EVENT` already says "whenever X happens". Its ability is a hand-written trigger in `engine/definitions/core/core-061.ts`, which does not read the `SUMMON` tag, so adding it would not change play. It would, however, make the Swarm starter deck (`engine/starter-decks.ts`, prefers `SUMMON` / `ON_DEATH`) treat it as a summoner and change that deck and its balance numbers. |
| PRIME_101 | Knight of the Twin Suns | Destroy an enemy minion with Guard | Guard | On Play, Destroy | **Leave as is.** It destroys an enemy minion *with* Guard; it does not have Guard itself. (Wrongly listed as a likely gap at first.) |

## To decide (32 cards)

| Card | Name | Text | Text names (not in array) | Array now | Verdict | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CORE_086 | Enhancement Potion | Buff a minion +2 Health and draw a card | Buff | Draw Card, Set Value, Target |  |  |
| CORE_099 | Shifty Slayer | Buff a minion w/Onslaught | Buff, Onslaught | On Play, Target |  |  |
| CORE_059 | Creature Tamer | Buff a Creature with Guard and +1/+2 | Buff | On Play, Guard, Target |  |  |
| CORE_114 | Expiration | Destroy a minion at the start of your next turn | Destroy | Expiration, Target |  |  |
| PRIME_250 | Cyanea; Lady of the Water | If you have an active Mystery at the end of your turn, Buff +2/+4 | Buff | Mystery, Event, Set Value, On Turn End |  |  |
| PRIME_132 | Light the Dark | Reveal all Concealeds (they lose it and take 1 damage). Destroy enemy's Mystery and draw a card if you did | Concealed | Mystery, Destroy |  |  |
| PRIME_221 | Mechanized Peace Keeper | Guard Destroy one of your Action Point Slots | Action Point Slot | Guard, On Play, Destroy |  |  |
| PRIME_209 | Blaze Storm | Deal 2 damage to all enemy minions, then Disable any left with 1 Health Overcharge (2) | Disable | Area of Effect, Overcharge |  |  |
| PRIME_080 | Brave Sprite | Whenever you Summon a Sprite, give it +2 Attack this turn and Stampede | Stampede | Event, Summon |  |  |
| PRIME_111 | Untamed Potential | Select One: +1/+1 to your Creatures; or Summon a 3/2 that has Stampede | Stampede | Select One, Set Value, Summon |  |  |
| PRIME_214 | Spirit of the Night | Guard, Bubble Your other minions have Stampede | Stampede | Guard, Bubble |  |  |
| PRIME_206 | Revitalization | Buff a minion with "On Death: Revitalization" | Buff | On Death |  |  |
| PRIME_058 | Sod Frog | Give your other Sprites +1/+1 and Bubble | Bubble | Buff |  |  |
| PRIME_169 | Paladin of the Shattered Mirror | Bubble, Guard On Death: Gain 5 Armor and equip a 3/2 Mace | Armor | Bubble, Guard, On Death |  |  |
| PRIME_244 | The DragonMancer | Stampede Onslaught while damaged | Onslaught | Stampede, Event, Set Value |  |  |
| PRIME_247 | Volcanic Giant | Costs 1 less for each point of Armor you have lost | Armor | Change Cost |  |  |
| PRIME_123 | Maven of Renewed Spirit | Select One: Draw 2 cards and take 2 damage; or heal your hero 5 and give a friendly minion Bubble | Bubble | Select One, On Play, Set Value, Draw Card |  |  |
| PRIME_149 | Psychopomp | If you have an active Mystery at the end of your turn, Buff +1/+2 | Buff | Mystery, Event, Set Value, On Turn End |  |  |
| PRIME_120 | Shamanic Rage | Select One: 4 damage to a minion and 1 to its neighbours; or 1 to all enemy minions and Disable them | Disable | Select One, Target, Area of Effect |  |  |
| PRIME_009 | Enraged Slug | +2 Attack and Stampede if damaged | Stampede | Event, Set Value |  |  |
| PRIME_079 | Catspurly Ghost | Destroy all Bubbles Gain +3/+3 for each | Destroy, Bubble | On Play, Set Value |  |  |
| PRIME_185 | Into the Shadows | Return a friendly minion to your hand; it costs 1 less and has Stampede when played | Stampede | Return, Change Cost |  |  |
| PRIME_019 | Phatcat Warrior | On Death: Summon a 2/1 Warrior Bot with Stampede | Stampede | On Death, Summon |  |  |
| PRIME_157 | The Wrong Door | Mystery When an enemy attacks, Summon two 1/1 Mice with Guard; the attack hits a Mouse | Guard | Mystery, Event, Summon |  |  |
| PRIME_048 | Invoked Shaman | Swap a minion's Attack and Health; it is Disabled | Disable | On Play, Set Value |  |  |
| PRIME_151 | Telekinesis | Deal X damage; If it's Disabled, draw a card | Disable | Draw Card |  |  |
| PRIME_124 | Forest Protector | Select One: +3 Attack and Stampede; or +3 Health, Guard and heal your hero 3 | Stampede | Select One, Set Value, Guard |  |  |
| PRIME_112 | Night Breeze | Select One: 2 damage and gain 2 Armor; or 1 damage and draw a card | Armor | Select One, Target, Draw Card |  |  |
| PRIME_075 | Krakken | Concealed | Concealed | (empty) |  |  |
| PRIME_113 | Spring Spell | Select One: +3 Attack and Stampede; or +3 Health, Guard and heal your hero 3 | Stampede | Select One, Set Value, Guard |  |  |
| PRIME_004 | Soul Miner | On Death: Deal 2 damage to a Random enemy minion, or the enemy hero if there is none | Random | On Death |  |  |
| PRIME_057 | Goblin's Dwelling | Can't Attack / Guard Give your opponent an Action Point | Action Point | Can't Attack, Guard, On Play |  |  |

## Left out on purpose

Cards with no name, inactive cards, and tokens are not listed. Rerun the check after an Airtable pull to see new ones.

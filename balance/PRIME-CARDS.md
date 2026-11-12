# PRIME card win rates (2026-11-12)

Random 30-card decks drawn from the playable PRIME pool (201 cards), greedy bot vs greedy bot, 12,000 games; then the same on Core + Prime decks (333 cards, 12,000 games). A card's win rate is how often the deck it was in won (a draw counts half). With about 3,600 games per card the noise is about +-1.6 points (95%); in the mixed run about +-2. Cards within 3 points of 50% are not distinguishable from average. "Played when in deck" is how often the bot actually played the card in games where it was in the deck: a low number means the bot rarely uses it, so its win rate says little about the card (a dead card pulls its deck down).

**Mysteries read as "played 0-13%" but that is a measurement artifact:** a face-down Mystery is deliberately not added to the cards-played history the sim reads, so the column is meaningless for them (the bot does place them since the 2026-11-12 fix; see `DECK-SIMS.md`).

Method: `balance/run-incl.sh <name> none 1000 prime|both`, then `node balance/merge.node.js /tmp/incl/<name>- none json`, then `node balance/prime-table.node.js`.

Spread of PRIME card win rates (rms from 50%): 2.07 points (CORE was 2.15 before the balance pass).

## The 25 best

| id | card | type | cost | win % (Prime decks) | win % (mixed decks) | played when in deck |
| --- | --- | --- | --- | --- | --- | --- |
| 157 | The Wrong Door | spell | 1 | 60.4% | 63.2% | 0% |
| 070 | Rusted Warden | minion | 5 | 60.0% | 60.7% | 45% |
| 167 | Sorcerer's Dance | spell | 6 | 59.3% | 59.2% | 48% |
| 251 | Conquest and Glory | minion | 10 | 55.1% | 56.3% | 27% |
| 169 | Paladin of the Shattered Mirror | minion | 8 | 55.0% | 57.1% | 39% |
| 055 | Suicidal Wizard | minion | 2 | 54.1% | 54.4% | 43% |
| 154 | Amaad the Shaper | minion | 7 | 53.7% | 58.2% | 39% |
| 227 | Zap | spell | 4 | 53.7% | 54.3% | 44% |
| 062 | Crumbling Golem | minion | 3 | 53.6% | 53.4% | 45% |
| 092 | Predator | minion | 3 | 53.3% | 54.1% | 44% |
| 067 | Android Infiltrator | minion | 4 | 53.2% | 52.9% | 46% |
| 225 | WarBoss | minion | 8 | 53.1% | 50.4% | 40% |
| 124 | Forest Protector | minion | 7 | 52.9% | 55.2% | 46% |
| 254 | Death and Despair | minion | 10 | 52.8% | 54.5% | 23% |
| 091 | Harry | minion | 3 | 52.7% | 53.0% | 44% |
| 214 | Spirit of the Night | minion | 8 | 52.6% | 52.3% | 39% |
| 032 | Siren | minion | 4 | 52.5% | 51.5% | 45% |
| 213 | Lava Titan | minion | 5 | 52.4% | 52.8% | 43% |
| 027 | Soul Collector | minion | 4 | 52.1% | 52.2% | 41% |
| 060 | Poisoned Imp | minion | 3 | 52.1% | 50.6% | 39% |
| 161 | Enigmatic Courier | minion | 3 | 52.1% | 50.6% | 46% |
| 084 | Serene Valley | minion | 7 | 51.8% | 54.2% | 28% |
| 174 | Forest Elemental | minion | 4 | 51.8% | 52.3% | 46% |
| 183 | Data-Mage | minion | 6 | 51.7% | 52.0% | 45% |
| 017 | Feline Fisherman | minion | 3 | 51.7% | 51.5% | 46% |

## The 25 worst

| id | card | type | cost | win % (Prime decks) | win % (mixed decks) | played when in deck |
| --- | --- | --- | --- | --- | --- | --- |
| 229 | Rai'Ki, Slayer of Beasts | minion | 9 | 45.5% | 44.7% | 31% |
| 015 | Twisted Time Tower | minion | 2 | 46.0% | 46.1% | 12% |
| 211 | Warpipe | item | 3 | 46.2% | 47.7% | 1% |
| 179 | Malevolent Cephalopod | spell | 4 | 46.2% | 46.1% | 41% |
| 057 | Goblin's Dwelling | minion | 3 | 46.6% | 46.8% | 45% |
| 247 | Volcanic Giant | minion | 12 | 46.6% | 46.2% | 6% |
| 202 | Divine Force | spell | 1 | 46.6% | 46.5% | 34% |
| 016 | Barracks | minion | 3 | 46.8% | 46.7% | 38% |
| 215 | Mushroomer | minion | 1 | 46.9% | 45.7% | 8% |
| 238 | Ring of the Lucii | item | 2 | 47.3% | 45.3% | 1% |
| 241 | Outer Beam | spell | 3 | 47.4% | 46.7% | 6% |
| 220 | Ancient Portal | minion | 5 | 47.4% | 46.5% | 27% |
| 200 | Molten Golem | minion | 1 | 47.4% | 48.4% | 44% |
| 216 | The Ritual | spell | 1 | 47.5% | 48.3% | 12% |
| 178 | Diminish All | spell | 4 | 47.5% | 45.4% | 18% |
| 086 | Spider Mech | minion | 12 | 47.7% | 47.1% | 19% |
| 155 | Crystal of Virtue | item | 1 | 47.7% | 44.6% | 1% |
| 223 | Cursed Concoction | item | 4 | 47.7% | 47.5% | 0% |
| 114 | Haranna's Curse | spell | 6 | 47.7% | 46.3% | 2% |
| 014 | Archery Yard | minion | 2 | 47.8% | 46.8% | 29% |
| 002 | Minilock | minion | 1 | 47.8% | 48.2% | 21% |
| 221 | Mechanized Peace Keeper | minion | 3 | 47.8% | 51.5% | 46% |
| 194 | Ignition | spell | 6 | 47.8% | 46.1% | 4% |
| 184 | The Sorceress | minion | 7 | 47.9% | 49.2% | 42% |
| 040 | Slick Naga | minion | 6 | 48.0% | 48.5% | 43% |

## Cards the bot rarely plays (under 35% of the games they were in): 62

Their win rates are mostly the bot's gap, not the cards' (the Mystery, Overcharge, item and discount cards cluster here).

| id | card | type | cost | win % (Prime decks) | win % (mixed decks) | played when in deck |
| --- | --- | --- | --- | --- | --- | --- |
| 157 | The Wrong Door | spell | 1 | 60.4% | 63.2% | 0% |
| 129 | Pit Trap | spell | 2 | 50.3% | 49.8% | 0% |
| 158 | Resurrection | spell | 2 | 49.9% | 47.6% | 0% |
| 143 | Commissioned Armor | spell | 3 | 49.1% | 48.2% | 0% |
| 146 | Black Hole | spell | 2 | 48.9% | 50.2% | 0% |
| 127 | Faint Slumber | spell | 2 | 48.7% | 47.2% | 0% |
| 148 | Watch Your Back! | spell | 3 | 48.7% | 48.6% | 0% |
| 156 | Surprise, surprise! | spell | 1 | 48.4% | 49.4% | 0% |
| 126 | Rage Unleashed | spell | 2 | 48.4% | 45.0% | 0% |
| 159 | Confrontation | spell | 2 | 48.2% | 49.2% | 0% |
| 152 | Bring the Night | spell | 3 | 48.1% | 48.0% | 0% |
| 223 | Cursed Concoction | item | 4 | 47.7% | 47.5% | 0% |
| 185 | Into the Shadows | spell | 1 | 48.4% | 46.1% | 0% |
| 155 | Crystal of Virtue | item | 1 | 47.7% | 44.6% | 1% |
| 211 | Warpipe | item | 3 | 46.2% | 47.7% | 1% |
| 238 | Ring of the Lucii | item | 2 | 47.3% | 45.3% | 1% |
| 114 | Haranna's Curse | spell | 6 | 47.7% | 46.3% | 2% |
| 140 | Tome of Spells | item | 1 | 48.2% | 46.7% | 2% |
| 196 | Soul Lantern | item | 1 | 48.0% | 45.6% | 2% |
| 194 | Ignition | spell | 6 | 47.8% | 46.1% | 4% |
| 247 | Volcanic Giant | minion | 12 | 46.6% | 46.2% | 6% |
| 241 | Outer Beam | spell | 3 | 47.4% | 46.7% | 6% |
| 215 | Mushroomer | minion | 1 | 46.9% | 45.7% | 8% |
| 216 | The Ritual | spell | 1 | 47.5% | 48.3% | 12% |
| 015 | Twisted Time Tower | minion | 2 | 46.0% | 46.1% | 12% |
| 178 | Diminish All | spell | 4 | 47.5% | 45.4% | 18% |
| 026 | Elder Shaman | minion | 4 | 48.3% | 49.2% | 18% |
| 132 | Light the Dark | spell | 2 | 49.9% | 47.6% | 19% |
| 171 | Coruscation | spell | 1 | 48.6% | 46.8% | 19% |
| 086 | Spider Mech | minion | 12 | 47.7% | 47.1% | 19% |
| 002 | Minilock | minion | 1 | 47.8% | 48.2% | 21% |
| 249 | Hell Executioner | minion | 10 | 50.7% | 50.9% | 21% |
| 170 | Holy Light | spell | 2 | 48.5% | 46.1% | 23% |
| 254 | Death and Despair | minion | 10 | 52.8% | 54.5% | 23% |
| 252 | War and Ruin | minion | 10 | 50.6% | 50.4% | 25% |
| 253 | Famine and Fear | minion | 10 | 50.0% | 50.1% | 25% |
| 165 | Bubbles for All! | spell | 5 | 50.1% | 47.3% | 26% |
| 116 | Book of the Unbroken | item | 9 | 50.1% | 49.9% | 26% |
| 245 | Nuclear Submarine | minion | 8 | 50.6% | 51.3% | 27% |
| 251 | Conquest and Glory | minion | 10 | 55.1% | 56.3% | 27% |
| 121 | Sanctity | spell | 5 | 49.1% | 48.1% | 27% |
| 220 | Ancient Portal | minion | 5 | 47.4% | 46.5% | 27% |
| 162 | Ready to Rumble | spell | 4 | 48.4% | 48.9% | 27% |
| 231 | Peace Keeping | spell | 2 | 48.5% | 48.7% | 27% |
| 084 | Serene Valley | minion | 7 | 51.8% | 54.2% | 28% |
| 014 | Archery Yard | minion | 2 | 47.8% | 46.8% | 29% |
| 244 | The DragonMancer | minion | 9 | 51.6% | 49.9% | 29% |
| 105 | Nightmare | minion | 9 | 49.0% | 49.6% | 30% |
| 163 | Enhancement | spell | 5 | 48.6% | 49.7% | 31% |
| 250 | Cyanea; Lady of the Water | minion | 6 | 48.1% | 47.4% | 31% |
| 228 | The Sorcerer's Stone | item | 6 | 49.9% | 50.8% | 31% |
| 242 | Snap | spell | 6 | 48.1% | 45.9% | 31% |
| 229 | Rai'Ki, Slayer of Beasts | minion | 9 | 45.5% | 44.7% | 31% |
| 096 | Parker Paddington | minion | 5 | 49.8% | 49.5% | 31% |
| 076 | Spellwolf | minion | 8 | 48.3% | 48.6% | 33% |
| 073 | Wandering Mystic | minion | 6 | 49.0% | 50.1% | 34% |
| 233 | Battle Shield | item | 2 | 50.0% | 49.4% | 34% |
| 202 | Divine Force | spell | 1 | 46.6% | 46.5% | 34% |
| 246 | The Chaos Knight | minion | 7 | 48.6% | 52.0% | 34% |
| 107 | Cronus | minion | 9 | 48.4% | 48.0% | 35% |
| 209 | Blaze Storm | spell | 3 | 50.6% | 50.0% | 35% |
| 072 | Marauder | minion | 6 | 50.0% | 50.2% | 35% |

## By mechanic tag (cards with at least 4 per tag; a card counts under every tag it has)

| tag | cards | mean win % | mean played |
| --- | --- | --- | --- |
| BUBBLE | 8 | 52.2% | 39% |
| SUMMON | 22 | 51.4% | 35% |
| ON_DEATH | 17 | 51.3% | 35% |
| BULWARK | 20 | 51.2% | 41% |
| STEAL | 6 | 50.8% | 40% |
| RANDOM | 24 | 50.7% | 34% |
| TARGET | 11 | 50.6% | 38% |
| CHOOSE_ONE | 10 | 50.6% | 41% |
| AOE | 20 | 50.3% | 30% |
| ON_PLAY | 44 | 50.3% | 40% |
| RUSH | 5 | 50.2% | 37% |
| HIDDEN | 6 | 50.2% | 36% |
| SET_VALUE | 43 | 50.1% | 40% |
| EVENT | 47 | 50.1% | 36% |
| MYSTERY | 17 | 50.0% | 13% |
| BUFF | 16 | 50.0% | 35% |
| HEAL | 6 | 50.0% | 34% |
| OVERLOAD | 8 | 49.9% | 40% |
| ADD_CARD | 6 | 49.8% | 24% |
| SILENCE | 6 | 49.7% | 33% |
| DESTROY | 14 | 49.6% | 31% |
| DISABLE | 4 | 49.6% | 20% |
| ON_END | 6 | 49.4% | 40% |
| COST | 7 | 49.4% | 26% |
| DRAW_CARD | 20 | 49.2% | 31% |
| BOON | 7 | 49.2% | 32% |
| DOUBLE_ATTACK | 5 | 49.1% | 43% |
| ARMOR | 4 | 48.9% | 23% |
| NO_ATTACK | 9 | 48.7% | 35% |

## By cost

| cost | cards | mean win % |
| --- | --- | --- |
| 0 | 1 | 49.1% |
| 1 | 28 | 49.2% |
| 2 | 46 | 49.8% |
| 3 | 40 | 49.9% |
| 4 | 18 | 50.3% |
| 5 | 18 | 50.5% |
| 6 | 24 | 50.4% |
| 7 | 8 | 50.4% |
| 8 | 5 | 51.9% |
| 9+ | 13 | 49.9% |

## By type

| type | cards | mean win % | mean played |
| --- | --- | --- | --- |
| spell | 48 | 49.8% | 25% |
| minion | 141 | 50.2% | 40% |
| item | 11 | 48.6% | 16% |
| weapon | 1 | 48.4% | 40% |

## CORE against PRIME in mixed decks

In the mixed run the average CORE card wins 49.9% of its games and the average PRIME card 50.1% (132 and 201 cards). The mixed decks hold about 9% CORE and 9% PRIME cards each, so this is the set-vs-set power difference as the bot plays them.

## What it says

- **PRIME's cards are about as tight as CORE was before its balance pass** (rms spread 2.07 points against 2.15), and **Core and Prime cards are even** in mixed decks (49.9% against 50.1%). No mechanic family averages outside 48.7% to 52.2%. So the lopsided deck results in `DECK-SIMS.md` (Swarm and Guardians winning about 85%) come from *synergy and curve* inside those decks, not from a few overpowered cards.
- **Three clear outliers on the high side** (about +10 points, well past the noise): 157 The Wrong Door (60%), 070 Rusted Warden (60%) and 167 Sorcerer's Dance (59%). All three hold up in mixed decks (63%, 61%, 59%). The next group (251, 169, 055, 154, 227) is at 54% to 55%.
- **The low side is shallow:** the worst card is 45.5% (229 Rai'Ki), and most of the bottom 25 are cards the bot barely plays (Warpipe, Ring of the Lucii, Crystal of Virtue and Cursed Concoction were played in under 2% of their games), so their numbers measure the bot, not the cards.
- **Cost curve is flat** (49.2% to 51.9%), which is what a tuned set looks like.
- **Nothing was changed on this evidence.** The three outliers are the obvious first candidates for a trim if you agree they play too well; the cheapest one to look at is The Wrong Door (a 1-mana Mystery that always lands two Guard Mice).

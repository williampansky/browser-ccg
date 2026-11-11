# Previous versions of the game

Notes on four earlier repos from the same project, kept as design and code reference. They
sit next to this repo on the author's machine (`www/`), not in it. This file records what is
in them so it doesn't need to be rediscovered.

**How this was produced:** a read-only survey (2026-11-10) of file layout, git history,
`package.json`, card/hero JSON and selected source files. No dependencies are installed in
any of them and **none were run**, so whether they still work is unknown. Statements about
lineage are inferences from dates and structure. Most component code was not read.

## Summary

| Repo | Active | Size | What it is |
| --- | --- | --- | --- |
| `react-ccg-dep` | Oct 2019 – Jun 2020 | 24 commits, ~1.7k lines | Lerna monorepo started from a boilerplate (its README is still the template's). Packages: `game`, `server`, `site`, `data`, `enums`, ... Last commit: "starting server over; refactoring from clean slate". Looks like an early restart that was dropped. |
| `hsclone` | Jan – Apr 2020 | 490 commits, ~20k lines JS | The main Hearthstone-style game. Create React App + boardgame.io 0.35. Has a boardgame.io server and a SocketIO client. |
| `react-card-game` | May 2020 | 12 commits, ~25k lines | A continuation of `hsclone` (same game code and boardgame.io version) with the site layer added: Redux, routing, deck builder, collection, filters. |
| `react-ccg-deprecated` | May – Jun 2020 | 135 commits, ~25k lines | Next.js rewrite combining the game and the site. Adds `airtable.js`, a Heroku `Procfile`, a lobby experiment, and a richer data set (heroes, abilities, mechanics). boardgame.io 0.39. |

Likely lineage: `hsclone` -> `react-card-game` -> `react-ccg-deprecated`, with `react-ccg-dep` as a
separate early/side attempt. The current repo (Next 12, TypeScript, boardgame.io 0.49,
zone/SNAP-style rules) was started later and is a different game design, not a continuation.

## What `hsclone` implemented (the Hearthstone-style rules)

Source layout: `src/lib/` (game logic, ~6k lines), `src/components/` (~10k lines),
`src/__tests__/` (~2.5k lines).

- **Rules:** two players with hero health, a board of minions per side, energy that goes up by 1 each
  turn, a card drawn at turn start, minions that attack minions or the hero. `endIf` ends the game when a
  player's health hits 0.
- **Classes and class skills:** 9 classes (Earthen, Ranged, Magic, Knight, Healer, Killer, Summoner,
  Enchanter, Melee), each with a 2-energy hero skill: e.g. Enhance (+1 attack and 1 energy shield),
  Sniper Shot (2 damage to the opponent), Lightning Strike (1 damage), Disciple (summon a 1/1),
  Mend (heal 2), Katar (equip a 1/2 weapon), Raise Dead (summon a random Undead), Power Within
  (trade 2 HP for a card), plus a 2-shield skill.
- **Weapons:** a player can equip a weapon (`lib/weapons`, `lib/state/player-weapon.js`) that
  sets the player's attack value; 5 weapon cards in the old CORE set (Basic Mace 1c 1/4,
  Crude Weapon 3c 3/2, Reckoning 4c 4/2 "restore 2 HP before every attack", Gladius 5c 3/4,
  Fisherman's Axe 5c 5/2). Only a few weapon ids are wired up there, and in the old data
  the weapons cards have no text. This is the closest prior art for the roadmap's "weapons" item.
- **30 mechanics** (`src/enums/mechanics.enums.js`): Boon (temporary bonus), Buff (permanent),
  On Death, **Bulwark** ("only these minions can be attacked", i.e. taunt), Rush, Double Attack,
  Hidden, Bubble, Expiration, Disable, **Armor** (secondary HP, players only),
  Energy, Can't Target, Combo, Debuff, Destroy, Discover, Draw Card, Immune, Lifesteal, Mystery,
  Overload, Poison, Set Value, Silence, Spell Damage, Steal, Summon, Transform.
  - Bulwark, Armor and Spell Damage are the legacy mechanics still attached to cards in the
    current repo (see `CARD-AUDIT.md`). `hsclone` shows what they originally meant.
  - There was also an "energy shield" (absorbs the next hit on a minion or player) and
    "onslaught"/stampede variants (`lib/mechanics/`).
- **Match history log** (`lib/match-history/`): human-readable log lines for attacks, plays, spells
  and kills. Could help with player experience and debugging.
- **Tests:** unit tests for boons, buffs, class skills, creators, moves (attack, play, draw,
  discard, forfeit, class skill), state (counts, energy, health, board methods) and spells.
  Jest, but not checked whether they pass.
- **Debug decks:** 11 prebuilt 30-card decks (Assassin, Augur, Berserker, Knight Commander,
  Mystic, Necromancer, Neutral x2, Sniper, Sorcerer, White Mage).

## Does `hsclone` still run? (tested 2026-11-11)

Yes, with small environment fixes. Done in a scratch copy under `/tmp`, so the original repo was
not touched.

- **Install:** `npm install --legacy-peer-deps` failed because the old native `node-sass`
  cannot build on Node 24. Swapping it for the pure-JS `sass` package (in the scratch copy only)
  fixed it. There is no `yarn` here, so `yarn.lock` was ignored and newer versions inside the
  `^` ranges were installed.
- **Client:** `react-app-rewired start` compiles (lint warnings only) with
  `NODE_OPTIONS=--openssl-legacy-provider` (webpack 4 on a modern Node).
- **Server:** `babel-node server.js` starts a boardgame.io server on port 8000. The client
  needs it even in "single player" mode: without it the screen sits on "Loading".
- **Result:** the game renders a recognisably Hearthstone-style board: hero portraits with 30 HP,
  minions with attack/health, energy crystals, a hand with green glow on playable cards, a deck
  list, a match log and an End Turn button. End Turn works (log line, "THEIR TURN", the opponent
  draws).
- **It is a two-tab game.** Even the "single player" entry (`AppSinglePlayer.jsx`) is two
  boardgame.io socket clients: the page is player `'1'` if its URL contains `3002`, otherwise
  player `'0'`. Open one tab normally and a second with `3002` in the URL (for example
  `http://localhost:3000/?as=3002` works, since only `href.includes('3002')` is checked) and
  they play each other through the server on port 8000. With a single tab the other side
  just never acts.
- **Playing works (verified in two tabs).** Interaction is **click a card to select it, then
  click to drop/target**, not drag and drop. A selected targeted spell highlights every
  valid target in red. Verified: casting Scholar's Desk (deck 26 -> 24, hand 5 -> 6 after the
  draw) and Magic Missile on an enemy minion ("Player 0 cast Magic Missle on Player 1's
  Aspiring Cleric for 6 damage", then "...was slain", board 6 -> 5 minions), with log lines
  and both tabs in sync. End Turn works too.
- **Summoning, minion attacks and minion play (verified in a second session):**
  - **Summon from a spell:** Magic Barrier ("summon a pair of 0/2 minions with Guard") put two
    0/2 "Primordial Defender" minions on the caster's side.
  - **Turn handoff:** End Turn passes play to the other tab, whose minions then glow green
    (able to attack) and the active player draws.
  - **Minion attacks:** clicking a glowing minion highlights its valid targets in red. The
    Guard rule is enforced: with a Guard alive, only Guards were targetable, not the hero. Combat
    is two-way (attack vs health), kills show in the log ("was slain"), and a minion that has
    attacked loses its glow. A 1-damage attack on a 0/2 Guard left it at 1 health, and a later
    attack killed it.
  - **Hero attack:** once no Guard was left, a minion attacked the hero for its full attack
    (hero 30 -> 27, log "attacked Player 0 for 3 damage").
  - **Playing a minion:** selecting a minion card shows dashed slots between the board minions;
    clicking one logs "summoned a Wondrous Wisp minion" and places it with no glow (summoning
    sickness). Its warcry (restore 2 HP) had nothing to heal, so it was not really exercised.
  - **Console noise:** each minion death logged `ERROR: disallowed move: killMinion` four
    times, probably a client calling a move it is not allowed to. Gameplay was unaffected.
  - **Draw count:** starting a turn took the hand from 5 to 7 more than once, so something draws
    an extra card per turn (not investigated).
- **Not exercised:** weapons, class skills, the Guard "Disable" and other keyword effects in
  depth, a full game to win/loss, player 0 attacking with its own minions (its only minions
  were 0-attack).
- **Debug settings are on:** energy cost is not enforced (`debugData.enableCost` is off, so
  every card in hand glows playable even with 1 energy), and player 1 starts with 6 minions
  on the board. The UI layout also expects a fixed-size window: at some sizes the bottom of the
  hand is clipped.
- **No bot:** `lib/game.js` still has the boardgame.io tic-tac-toe `ai.enumerate`
  (`clickCell`) from the tutorial, so there is no working AI in this version. Playing solo
  means driving both tabs yourself.
- **Unit tests:** `npx jest` gives 63 passing and 38 failing of 101 tests. The failures I
  looked at are stale fixtures (state fields such as `allPlayedCards` and `energy` missing from
  test state), plus one test importing a module that no longer exists. They are not
  environment problems.

## Multiplayer and hosting: what existed

- **`hsclone` and `react-card-game`:** a boardgame.io `Server` (port 8000) and a `Client` using
  `SocketIO({ server: 'localhost:8000' })`. The player is chosen by a button, or by URL port
  (`3002` becomes player `'1'`, anything else `'0'`). There is no auth, lobby or matchmaking; the
  README lists "lobby for multiple concurrent games" and "queue system to match up players" only as
  future work (0.0.2). So it is a working-looking two-client proof of concept, hard-coded to localhost.
- **`react-ccg-deprecated`:**
  - `server.js` runs the boardgame.io `Server`, serves the built front end with `koa-static`, and
    listens on `process.env.PORT` (default 8000). `Procfile`: `web: node -r esm server.js`. This is
    the earlier version of the "host on Heroku" TODO. Whether it was ever deployed is unknown.
  - `pages/play/lobby` uses boardgame.io's `<Lobby>` component, but wired to the **TicTacToe
    sample game**, not the real one. `pages/play/multiplayer` uses `Local()` multiplayer with TicTacToe.
    So lobby support was experimented with but never connected to the card game.
- **Version note:** these used boardgame.io 0.35-0.39. The current repo uses 0.49. APIs changed
  between them, so treat the old code as a sketch, not copy-paste.

## The old card pool (much larger than today's)

Data lives in `react-ccg-deprecated/data/cards/` and `react-ccg-dep/packages/data/src/`
(identical sizes). The latest version of each:

| File | Cards | Notes |
| --- | --- | --- |
| `cards-CORE.json` | 132 | 59 minions, 52 spells, 16 items, 5 weapons; all `FREE` rarity; no classes assigned |
| `cards-PRIME.json` | 254 | 166 minions, 70 spells, 11 items, 7 weapons; rarities Common 94 / Superior 78 / Mythic 49 / Remarkable 33 |
| `cards-ENTOURAGE.json` | 43 | tokens/summoned cards |
| `heros.json` | 9 heroes | each with lore, art credit and 3 abilities (one an ultimate) |
| `abilities.json` | 15 | hero abilities with cost and cooldown |
| `mechanics.json` | 49 | mechanic definitions |

Observations:

- **The current 69-card core set is a rewrite, not a subset.** Card ids were reassigned.
  68 of the current ids also exist in old CORE, but 46 of those now belong to a *different*
  card (e.g. old `CORE_040` was Wandering Blobber, now `040` is Sanctuary; old `041` was
  Nature Dragon, now Destroy Random). Do not assume an id means the same card across repos.
  Names are a better key: 44 current names also appear in old CORE.
- **64 old CORE cards have no equivalent in the current set**, mostly spells and items:
  - **Direct damage:** Magic Missile, Starfall, Fireballs (3 random enemies), Sunder (all
    enemies), Cosmic Blast, Spin Chain, Slice, Shot from Above, Lifesteal, Last Word.
  - **Conditional removal:** Invocation of Agony (destroy an enemy with <=3 attack) and
    Extinction (>=5 attack), Expiration (destroy at the start of your next turn).
  - **Disable:** Disabling Kick, Mass Stasis, Distortion, Rimefire Bolt.
  - **Transform / steal:** Mutate, Transmogrify, Indoctrination (10c steal).
  - **Healing items:** Mending / Recovery / Restoration Potion, Ritual Sacrifice (sacrifice a
    minion for HP). These assume a player health total, which the current game doesn't have.
  - **Buff items/spells:** Scroll of Power (+3 attack), Scroll of Inspiration (+4/+4), Aspect
    of Enhancement (double health), Demonic Wrath (+3 attack to all).
- **PRIME is the interesting pool for new designs.** Notable mechanics: Event/"whenever you
  play a card" (48 cards), On Death (18), Mystery/secret (20), Overload (10), Combo (7),
  Silence (6), On End (6), Return (3). Examples: Amaad the Shaper (7c: whenever you play a card, add a
  random card to your hand that costs 4 less), Well of Infinite Tidings (3c 0/3: draw a card at
  end of turn), Soul Miner (1c: on death, 2 damage to the enemy player), Death and Despair (10c
  10/10: destroy all minions), Soul Lantern (0c: next spell costs 2 less).
- **Rarity tiers match the current assets.** The Common / Superior / Remarkable / Mythic names
  correspond to the rarity gem images already in `public/images/card-assets/`; PRIME is where
  those tiers were designed, and the current CORE is all Free (plus 4 Mythic).
- **The old card JSON contains an `inspiration` field** naming the Hearthstone card(s) behind each
  entry. It is filled for every entry in `hsclone` and `react-card-game`
  (`src/data/debug/cards-{CORE,PRIME,ENTOURAGE,GAME}.json`) and only for the single GAME card in
  `react-ccg-dep` and `react-ccg-deprecated`. This repo's current data and Airtable pull omit it;
  don't copy it across when reusing old data.
- **Art credits:** the old data credits Rexard (a GraphicRiver asset seller) on CORE cards and
  named ArtStation artists on heroes. This is the same provenance question raised in
  `CARD-AUDIT.md` section 6.

## Heroes

`react-ccg-dep` and `react-ccg-deprecated` have 9 named heroes (e.g. Atlas: ranged, poison
weapon / sulfuric cloud / "command army": summon seven 1/1 poison minions; Asar: melee, dagger weapons). Each has
3 abilities with energy cost and cooldown, one of them an ultimate (cost 8-10).
This is a character system the SNAP-style game doesn't have. It could be a monetization angle
(collectible heroes with different abilities), but that is speculation for later.

## What might be worth borrowing

These are suggestions, and none of them has been tried.

1. **Legacy-card decision (CARD-AUDIT section 1):** `hsclone` documents what Bulwark, Armor and
   Spell Damage meant, which helps with redesigning them as zone-style effects.
2. **Weapons:** the equip / attack-value model and the 5 old weapon cards.
3. **New card ideas:** PRIME's Event, On Death, Mystery and End-of-turn cards. Event and
   end-of-turn cards map most naturally onto the current engine, which already has
   event listeners and `onTurnEnd`.
4. **Tests:** the old unit-test layout (moves/state/spells/class-skills) is a pattern for the
   "one test per card" item in the roadmap.
5. **Multiplayer spike:** the `Server` + `SocketIO` client is a small starting point, and the
   `koa-static` + `Procfile` setup shows an earlier single-process deploy. Both need porting
   to boardgame.io 0.49, and neither has auth, lobbies or matchmaking.
6. **Match history log** as a player-experience feature.

## Not checked

- Whether any repo installs, builds or runs; whether its tests pass.
- Most component, animation and styling code.
- Most PRIME cards beyond samples, and the content of the hero lore.
- The `react-ccg-dep` `site`, `components` and `game` packages (it is ~1.7k lines).
- `dependabot` branches on the remotes (they imply the repos are on GitHub, but no
  remotes were contacted).

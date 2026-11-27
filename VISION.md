# Vision

## What this is

A browser-only, turn-based collectible card game in the style of the **original Hearthstone**
(before expansions): two players, a hero with health, minions that attack and trade, spells,
weapons, class skills, Guard (taunt) and similar keywords, and alternating turns.

The author loved original Hearthstone. A first Hearthstone-style version (`hsclone`, 2020) was
built by hand and worked, but was hard to keep building alone, so the project moved to a simpler
zone/SNAP-style format (Marvel SNAP influence). That version was playable but the author only
"sorta" liked it. After seeing `hsclone` run again, the decision (2026-11-11) was to go back to
the Hearthstone-style game. The zone/SNAP version is archived (tag `snap-style-v0`, branch
`archive/snap-style`), not deleted.

## Background

Passion project, started by hand in 2020 and set aside in 2023. All code up to 2023 was written by
hand, before AI coding tools. Much of the card art was **purchased from asset sites** and the rest is
free-to-use. The intent is to eventually grow it into a real multi-user game, possibly
with some form of monetization. There is no committed timeline or definition of "done" yet.

## Priorities

Most important:

1. **Card design and balance.** The cards and their mechanics are the game.
2. **Multiplayer.** Moving from a local/bot game to player-vs-player and multi-user. An online alpha (queue, bot
   fallback, no accounts) has been live at bccg.io since 2026-11-26.
3. **An enjoyable experience.** It should feel like Hearthstone did: readable boards, satisfying
   trades, clear feedback.

Secondary:

- Store and collecting
- Visuals polish

## Principles for the rebuild

- **Rules first, UI second.** Build the engine as plain, tested TypeScript that can play a whole
  game headless, then put the board on top.
- **Test-driven.** Port `hsclone`'s unit tests and rules as the starting point.
- **Keep the old game recoverable.** Nothing is lost; the archive tag/branch has it.
- **Mechanics are fine to reuse, names and art need care.** Before any commercial launch, the
  card names, flavor text and art need a provenance/licence review (see `CARD-AUDIT.md` section 6).

## What "done" means: v1.0.0

The author's definition (2026-11-27). The game itself is already in a good place for its original pre-expansion
release; v1.0.0 is the game around it:

- **User accounts**, replacing the per-browser localStorage profile and decks.
- **Card collecting, per account:** CORE starts unlocked, PRIME is collectable (the acquisition column in Airtable is
  not finished yet).
- **A cosmetics shop, for real money:** hero skins (for example Zeus as a Wizard skin that changes the avatar), skill
  cosmetics, sounds and similar.
- **A card pack shop, for real money:** PRIME packs that give random PRIME cards.
- **A collection-only currency:** duplicate PRIME cards beyond the copy limit (2, or 1 for a Mythic) can be destroyed
  for it, and it buys unowned cards.
- **Rank and level tracking** per class and per account, and a **global leaderboard**.
- **Class skills 2 and 3** (the third is an ultimate) for every class, added slowly and balance-tested; today only
  skill 1 is active.
- **Further polish** on the UI, sounds, interactions and spells.

## Open questions

- How the shop, packs and currencies are set up (the model is cosmetics and PRIME packs; the details are not designed).
- What is out of scope for v1.0.0 (not decided yet).

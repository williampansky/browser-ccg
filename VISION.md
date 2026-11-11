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
hand, before AI coding tools. Much of the card art was **purchased from asset sites**, and some is
temporary placeholder. The intent is to eventually grow it into a real multi-user game, possibly
with some form of monetization. There is no committed timeline or definition of "done" yet.

## Priorities

Most important:

1. **Card design and balance.** The cards and their mechanics are the game.
2. **Multiplayer.** Moving from a local/bot game to player-vs-player and multi-user.
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

## Open questions

- What "done" or success looks like (a playable beta, public launch, revenue?).
- Monetization model, if any.
- How literal to be with Hearthstone (classes, hero powers, exact keyword set) vs. the author's own
  twists from `hsclone` (energy shield, Disable, Expiration, class skills).
- Which cards from the current set (69), the old CORE set (132) and the old PRIME set (254) make the
  cut for a first release.
- What is out of scope.

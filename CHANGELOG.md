# Changelog

What changed, newest first. Written from the git history; `git log` has the detail.

## 2026-11-13

- **Bot fix:** the greedy bot no longer sees through your face-down Mystery. It used to simulate its moves on the real state, so it avoided
  any attack the Mystery would punish (it could stop attacking for turns); now it plans without the Mystery and just attacks into it.
- **Heroes:** five heroes (Zeus, Forsaken Druid, Exile, Warrior, Cleric) with three skills each, usable on `/play`: skill buttons above
  your hero bar (click; targeted skills then aim), cooldowns and one-use ultimates, picked in New game (or `?h0=ZEUS&h1=WARRIOR`).
  The AI uses skills too. Readings I chose are in `RULES.md` Appendix D.
- `/collection` is a browser of every playable card (Core + Prime) with search and filters and a card detail window.
- `/profile` is the page for your name and colour (moved out of the `/play` menu).
- The `/play` menu is redesigned: Resume, New game and Concede cards, switch rows for sound, timer and accessibility,
  segmented Opponent and Mode choices, and Home / Deck builder / Cards links (asks before leaving a live game).
- The bottom nav has a Home button and highlights the current page.
- Home, News and Changelog render the repo's `README.md`, `ROADMAP.md` and `CHANGELOG.md`.

## 2026-11-12

- **Play:** player profile (display name and colour theme), quieter sound effects, redrawn board minions
  (oval art, sword/shield badges, status icons), a smoother hand, a 60-second turn timer, Mystery badge on the hero bar,
  accessibility mode, Shift+Space to attack the hero.
- **Engine:** Mysteries, Overcharge, Suppress, cost modification, Poison, temporary control, random card pools and
  a long run of PRIME cards (201 of 254 playable). A 30-card deck limit and a copy limit.
- **Decks:** 12 Core, 10 Prime and 8 Core + Prime starter decks; a new deck builder with a card detail window;
  a new-game deck picker.
- **Data and balance:** card data rebuilt from the new Airtable base with the balance pass applied; PRIME win-rate tables.
- **Art:** PRIME card art copied in, a placeholder for cards with none, `-DECK` strips matched to `hsclone`.

## 2026-11-11

- **Play:** framed cards (rarity frames, cost gems, badges), the `hsclone` hand feel, a new hero bar,
  rich card text and debug URL params.
- **Cards:** TacMedic became Frontline Guardsman (a plain 2/4 Guard); weapons lose the "Equip" prefix.
- **Docs:** README refreshed with a notice that the card art is placeholder and not licensed for reuse.

## Earlier

The Hearthstone-style engine was rebuilt from scratch on branch `hs-rebuild` (card model, turn flow, minions and
combat, spells, keywords, triggers, weapons and armor, then every CORE card). The earlier zone-style game is kept at
tag `snap-style-v0` and branch `archive/snap-style`.

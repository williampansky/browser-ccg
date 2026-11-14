# Changelog

What changed, newest first. Written from the git history; `git log` has the detail.

## 2026-11-14

- **Interchangeable interface themes:** the site chrome (page colours, bottom nav, markdown pages, profile) and the `/play` menus (menu button, menu, deck picker, choose-one dialogs) now read `--ui-*` CSS variables, so a whole look can be swapped. Three themes: Classic (the old look, the default), Emberhold and Frostforged (the Emberhold UI kit: 9-slice panels and buttons, toggle art, its menu sounds). Pick one in the `/play` menu, on `/profile`, or with `?ui=<id>` on any page (saved); `/theme-lab` (dev only, not linked) shows all of them side by side. Cards, minions and heroes are untouched. The collection, deck builder, heroes viewer and profile are themed too, and every control on them (and in the `/play` menu) now comes from shared components in `components/ui/` (`Button`, `Select`, `TextInput`, `Checkbox`, `Toggle`, `SegmentedControl`, `Panel`), so a theme or a behaviour change reaches all of them; the mana-cost and card-size buttons are now proper radio groups. **Animated icons** from the Basic Shapes packs (22 crosses, plus signs, dots and a cross-into-checkmark, as 96 px frame sequences, 1.4 MB in all and loaded only when an icon first plays): an `AnimatedIcon` component that takes the text colour and plays forward or back; the checkbox tick uses it. A gallery is on `/theme-lab`. Form rows (`ui-controls`) give every control one height per theme, so Clear filters appearing no longer moves anything. Adding a theme is one entry in `components/ui-theme/ui-themes.ts` plus one block in `styles/themes/_themes.scss`. Themed menus can play the kit's click, toggle and open/close sounds (they follow the existing Sound switch; Classic is silent).
- **Board minion look (tuned in the minion lab):** the attack badge is 44px (was 40) and 1px lower, the health badge 2px lower, the attack numeral moved to (2px, 4.2px) and the health numeral 0.5px left, the keyword icons 4px lower, and the minion's name is no longer shown on the board (it is only visually hidden, so screen readers still get it; `/minion-lab?lcshow=1` shows it). The offsets are CSS variables (`--nudge-x` / `--nudge-y`) with these defaults, so the lab's sliders start from them.
- **`/minion-lab`** (dev only, not linked): the board minion on its own, in a gallery of looks (plain, Guard, Bubble, Concealed, status icons, damaged, buffed, suppressed), with sliders and number boxes for the overall shape (height, aspect, corner radius, border, picture offset, guard shield) and for where the attack and health badges, the name and the keyword icons sit (the keyword icons also have size, gap, ring, corner, glyph and per-keyword colour controls), plus each badge's own numeral size and position. Also a state preview (ready, selected, aimed) and a preview zoom. Sliders start at the real values, and the URL holds every setting.
- A clicked minion now lifts (14 px) as well as growing (1.08x). The growth never actually showed before: the landing animation held its last frame and overrode the selected transform, so it is now `backwards` instead of `both`. A target you aim at no longer scales on hover (ring only; it was meant to be 1.1x but never showed). The board lab can tune the lift, the scale and the target-hover scale, and every slider has a number box for exact values.
- **`/board-lab`** (dev only, not linked): the real `/play` board frozen into a setup you choose, with a draggable, collapsible overlay of layout knobs. Everything is in the URL, so a layout can be shared. No bot and no clock; boards, energy and whose turn it is change live without touching the hands or decks (heroes and hand ids restart it, with a fixed seed so the deck is the same each time). Knobs: minion size and gap, the energy bar (scale, X/Y, vertical or horizontal), section gap, table width, hand sink, both hands' card widths, the clicked-card scale (with a preview), both hero figures' width and X/Y position, and the log / deck panels (swapped, or stacked and scrolling independently). Sliders start at the board's real values. Presets save the URL (all of it, or layout only), with a Flip A/B button. `PlayBoard` takes an optional `lab` prop for this; `/play` does not pass it.

## 2026-11-13

- A card dragged to aim at a target no longer grows to the click's 2x; `.prettierrc` added (the hero skills component is reformatted to it).
- **Weight (second pass):** dead minions fall, spin and fade before the row closes; a minion played from your hand is flown to its slot before it lands; hits, landings and deaths have a heavier thud, played at the moment of impact; the spell popup slams in with a shockwave; "Attack hero" lunges each attacker in turn; tooltips no longer fly off to the far side when you aim an attack (they render into the page body and hide while aiming).
- **Weight (first pass):** new minions drop in, land with a squash and a dust ring; attackers wind up and lunge into their target (minions and weapon swings); the target shakes on contact, not before; damage and heal numbers float up from minions and heroes; a hit of 4+ jolts the table. All of it is skipped under reduced-motion. `components/play-board/motion.ts`.
- **Energy bar:** a tall column of energy orbs beside the board (right edge), with the count above. Dragging or selecting a card pulses the orbs it would spend (red when you cannot afford it).
- **Playtest fixes:** a selected hand card is bigger (2x), hero skill tooltips open over the minions, the Attack number on board minions is centred on its badge, and hero tokens (Spirit Animals, Eagle) get a real tooltip instead of "undefined", and a hovered hand card draws over the hero bar and skills.
- **Hero art:** the "1" / "2" / "AI" circle on the hero bar is now the hero's portrait (still shown when a player has no hero), and the skill buttons are round icons with a cost badge, a cooldown number and the name and text on hover. Art is in `public/images/heroes/<ID>/` (copied from `react-ccg-deprecated`, resized; provenance unchecked like the rest).
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

# Play board, spell effects and cards (loaded when working in components/play-board)

Moved out of the root `CLAUDE.md` so it only loads when this folder is in play.
The root `CLAUDE.md` still holds the rules that apply everywhere.

## Spell effects (Pixi layer, `/spells-lab`)

- **Files:** `components/play-board/pixi-fx.ts` (the drawing, one transparent canvas over the page; `?fx=off` turns it all off), `spell-fx.ts` (which spell gets which base), `spell-fx-tune.ts` (every number: `SpellFxTune`, `SPELL_FX_DEFAULTS`, per-spell `SPELL_FX_VARIANTS`, `SPELL_FX_PARENTS`, `SPELL_FX_CHOICES`), `spell-fx-sprites.ts` (the pictures), `motion.ts` (`shoot`, `spot`, `area`, `flashHit`: element-based calls that read positions now and draw later), `components/spells-lab/` + `pages/spells-lab.tsx` (the lab). Tests: `components/play-board/__tests__/spell-fx*.test.ts`.
- **Bases (`SpellFxKind`)** are named by where the effect is anchored: `travel` (caster to each target hit; an orb, or a picture that sticks in; streamers, stretch), `strike` (falls from above onto each target; a jagged bolt or a straight beam, leaned by `strikeAngle`; or a picture), `spot` (once, on the spell's target or the caster's hero, no damage needed; rings, glow, sparks, a picture), `area` (once over a side of the board for a global spell; swirl, sweep, shockwave, rain). Options are `has...` flags, pick-one fields are listed in `SPELL_FX_CHOICES`, and the lab shows only the knobs the chosen base/option can use.
- **Keys:** a spell is a card id (`CORE_098`), a hero skill (`WIZARD:1`; the first skill is 1) or an event (`EVENT_KEYS`: `summon` always plays; `heal`, `buff`, `death` play once baked). `SKILL_FX` / `CARD_FX` / `EVENT_FX` assign a base; a spell with no entry plays `travel`. `SPELL_FX_PARENTS` makes a spell start from another's look (Crusader 1 and Mystic 1 from `summon`).
- **Damage timing:** the impact time (`setImpactMs`) decides when the floating number, hurt shake, table jolt (`BIG_HIT_DAMAGE`) and the health shown (`use-impact-delayed.ts`) land. With the "Damage waits for effects" setting (`damage-delay.ts`, default on; lab checkbox / `delay=0`) it is the end of the whole effect (`spellFxTotalMs`), else the first impact (`spellFxMs`). The lab lists minions with triggers or On Play effects (`minionsWithEffects`) and previews a hit on the sample minion (`dmg`).
- **Workflow:** tune in `/spells-lab?sp=<key>` (the URL is the setup; Space plays; "Copy a look from another spell"; sample minion, board and several-targets checkboxes), then `npm run spell -- "<lab url>"` writes the entry (`--dry` previews, `--defaults` bakes into the defaults).
- **A new number:** a field in `SpellFxTune`, its default, a knob in `components/spells-lab/spell-knobs.ts` (with `when` so it only shows when usable), and its use in `pixi-fx.ts`.
- **A new picture** (a throwable or an icon): `npm run fxsprite -- <png | pack:icon> <id> "<label>" [--tip=-45]` (`npm run asset -- axe` finds icons; packs `weapon-armor-01`, `weapon-armor-04`, `gems`, `potion`, `loot` are read from the `transparent` folders under `~/Downloads/ICONS_BADGES`). It trims and scales the picture to `public/images/fx/sprites/<id>.png` and adds it to `SPELL_FX_SPRITES`, which feeds the lab drop-down and the choices. `tip` is where the point faces on screen in degrees (0 = right, -90 = up, 90 = down); round things take any tip and a spin.
- **A new style or base:** add the value to the tune type and `SPELL_FX_CHOICES`, draw it in `pixi-fx.ts`, add its knobs (with `when`), and a test. Keep delayed callbacks out of loops that close over the loop variable (see Things worth knowing).

## Playing `/play`: drag and drop, debug params

- **Drag and drop is the main way to act; click is the fallback.** Drag a hand card onto your board (it lands in the
  gap nearest the pointer), onto a legal target, or onto the play area (untargeted spells). Drag a ready minion or your
  hero onto an enemy to attack. Untargeted spells and items cast from anywhere on the board above the player bar (the dashed
  `castArea` overlay; drop or click there). A double-click on such a card in the hand casts it at once (a minion: plays at the far right). **Space** ends the turn; **Shift+Space** is "Attack hero" (only when that button is
  available). The weapon glows green when it can attack.
  **Accessibility mode** (one menu option, saved in localStorage; `accessibility.ts`) turns on the hover `title` tooltips (off by
  default, use `titleIf`), a keyboard focus outline and the explicit "Play" buttons; it is a start, not a full WCAG pass. Dragging just selects, so the highlights and arrow match click-to-select, and a drop
  runs the same code as a click. "Choose one" cards (including Surveying Drone) are not selected while dragged (that
  would open their dialog mid-drag): the drop remembers where you dropped, opens the dialog, and picking an option
  plays it there. Hover popups are hidden during a drag (`body.dragging`), and drags that aim at a target (attackers, and
  cards with a target) use an invisible drag image (the arrow shows the aim; a ghost would cover the target). Cards
  dropped on the board or play area keep their ghost. It uses native browser drag, so it does not work on touch screens.
- **Spell effects** (Pixi layer, `components/play-board/pixi-fx.ts`; bases, per-spell looks and the lab are in `spell-fx.ts`, `spell-fx-tune.ts` and `/spells-lab`) are on by default; `?fx=off` switches them all off.
- **Debug URL params** (read on every "New game" while they are in the URL): `?first=0|1` picks who goes first
  (0 = Player 1); `?p0=CORE_045,CORE_051` and `?p1=...` put those cards in that player's opening hand, in order.
  `?b0=CORE_027,CORE_061` and `?b1=...` put ready-to-attack minions on that player's board (no On Play effect or aura runs),
  `?w0=CORE_076` and `?w1=...` equip a weapon, `?e0=10` and `?e1=...` set that player's energy (current and total, 0-10). Handy for testing a specific card, e.g. `/play/local?first=0&p0=CORE_045`.

- **Framed cards (`components/play-board/CardFace.tsx`)** port `hsclone`'s `CardV3`: the art sits behind a rarity frame PNG
  (`public/images/frames/<COLOR>.png`; **which rarity gets which colour is the `RARITY_STYLE` table in `card-face-model.ts`**: Free steel with no gem, Common green, Superior blue, Remarkable purple, Mythic red; the files are named by colour, and the frame and gem for a colour were measured to match) and the cost gem, name ribbon, text, type, rarity gem and sword/shield badges are laid
  over it in the frame's 178 x 250 design units, scaled by the `--u` CSS variable (so use `u(n)` in its SCSS, never `em`:
  an element's own font-size would change its offsets). **Card text wraps itself** (`softenBreaks`, `textLines` in `card-face-model.ts`; `text-wrap: balance` per line): write Airtable descriptions without `<br>` except for real structure (after a keyword, around a `<small>` line, after a finished sentence or clause, before a keyword line); a break in the middle of a sentence is turned into a space. Hand cards and the cast popup use it; board
  minions and the choose-one dialogs do not yet. **The hand's feel is ported from `hsclone`** (`components/play-board/hand-fan.ts`
  plus the `.handSlot` rules in `play-board.module.scss`): hsclone does it with plain CSS transitions, not react-spring (which
  it never used; `react-spring` in this repo's `package.json` is unused). Cards fan by index (`--fan-rot`, `--fan-drop`), overlap
  by `HAND_OVERLAP`, sink below the window edge (`--hand-sink`, set inline from the window height) and lift to 1.5x on hover
  (an in-place lift replaced the old hover popup). The `.hand` row has `pointer-events: none` so the lifted cards never block
  the hero bar. Dragging hides the source card and uses a centred clone as the drag image (the browser's own snapshot is of
  the hover-lifted card and lands far from the cursor).

import { heroes } from '../../engine';
import { CSS_FNS } from '../play-board/layout-css';

export type Num = {
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  css: (v: number) => string;
  /** Reads the board's current value for this knob from the DOM (used for the slider's default while no override is set). */
  read: () => number | undefined;
};

export const px = (v: string | undefined) => {
  const n = parseFloat(v ?? '');
  return Number.isNaN(n) ? undefined : Math.round(n);
};
export const first = (name: string) => document.querySelector<HTMLElement>(`[class*="play-board_${name}__"]`);
export const cs = (name: string) => {
  const el = first(name);
  return el ? getComputedStyle(el) : undefined;
};

/**
 * The top end of every slider, in one place (px unless noted). Edit freely: a slider whose real default is above its max stretches
 * to fit it anyway. The offset sliders (lfx0 ... ley, lgx ... ldy) run from minus this value to plus it.
 */
export const SLIDER_MAX = {
  // Minions and table
  lm: 200,
  lg: 40,
  ls: 60,
  lw: 2000,
  // Clicked minion
  lml: 80,
  lms: 2,
  lmh: 1.5,
  // Hands
  lhs: 160,
  lhw0: 260,
  lhw1: 260,
  lsel: 3,
  // Hero figures (width, then X / Y offset: the offset sliders run from minus this to plus this)
  lfw0: 320,
  lfw1: 320,
  lfx0: 2000,
  lfy0: 2000,
  lfx1: 2000,
  lfy1: 2000,
  // Log and deck panels
  lsplit: 85,
  lgw: 700,
  ldw: 700,
  lgx: 2000,
  lgy: 2000,
  ldx: 2000,
  ldy: 2000,
  // Energy bar
  les: 3,
  lex: 1500,
  ley: 1500,
  // Board (the engine caps a board at 7 minions; energy is 0-10)
  minions: 7,
  energy: 10
};

export const NUMS: Num[] = [
  { key: 'lpsh', label: 'Portrait scale on hover (x)', min: 1, max: 1.6, step: 0.01, css: CSS_FNS.lpsh, read: () => 1 },
  { key: 'lpss', label: 'Portrait scale when selected (x)', min: 1, max: 1.6, step: 0.01, css: CSS_FNS.lpss, read: () => 1 },
  { key: 'lpsm', label: 'Portrait scale speed (ms)', min: 0, max: 600, step: 10, css: CSS_FNS.lpsm, read: () => 150 },
  { key: 'lpsy', label: 'Portrait scale centre, from top (%)', min: 0, max: 100, step: 1, css: CSS_FNS.lpsy, read: () => 30 },
  { key: 'lshdefy', label: 'Default: shadow down (px)', min: -20, max: 60, css: CSS_FNS.lshdefy, read: () => 3 },
  { key: 'lshdefb', label: 'Default: shadow blur (px)', min: 0, max: 60, css: CSS_FNS.lshdefb, read: () => 12 },
  { key: 'lshdefa', label: 'Default: shadow darkness', min: 0, max: 1, step: 0.05, css: CSS_FNS.lshdefa, read: () => 0.55 },
  { key: 'lshrdyy', label: 'Ready to attack: shadow down (px)', min: -20, max: 60, css: CSS_FNS.lshrdyy, read: () => 3 },
  { key: 'lshrdyb', label: 'Ready to attack: shadow blur (px)', min: 0, max: 60, css: CSS_FNS.lshrdyb, read: () => 12 },
  { key: 'lshrdya', label: 'Ready to attack: shadow darkness', min: 0, max: 1, step: 0.05, css: CSS_FNS.lshrdya, read: () => 0.55 },
  { key: 'lshsely', label: 'Selected / lifted: shadow down (px)', min: -20, max: 60, css: CSS_FNS.lshsely, read: () => 14 },
  { key: 'lshselb', label: 'Selected / lifted: shadow blur (px)', min: 0, max: 60, css: CSS_FNS.lshselb, read: () => 18 },
  { key: 'lshsela', label: 'Selected / lifted: shadow darkness', min: 0, max: 1, step: 0.05, css: CSS_FNS.lshsela, read: () => 0 },
  { key: 'lshaimy', label: 'Can be aimed at: shadow down (px)', min: -20, max: 60, css: CSS_FNS.lshaimy, read: () => 3 },
  { key: 'lshaimb', label: 'Can be aimed at: shadow blur (px)', min: 0, max: 60, css: CSS_FNS.lshaimb, read: () => 12 },
  { key: 'lshaima', label: 'Can be aimed at: shadow darkness', min: 0, max: 1, step: 0.05, css: CSS_FNS.lshaima, read: () => 0 },
  { key: 'lshhovy', label: 'Aimed at (hovered): shadow down (px)', min: -20, max: 60, css: CSS_FNS.lshhovy, read: () => 3 },
  { key: 'lshhovb', label: 'Aimed at (hovered): shadow blur (px)', min: 0, max: 60, css: CSS_FNS.lshhovb, read: () => 12 },
  { key: 'lshhova', label: 'Aimed at (hovered): shadow darkness', min: 0, max: 1, step: 0.05, css: CSS_FNS.lshhova, read: () => 0 },
  { key: 'lm', label: 'Minion height (px)', min: 70, max: SLIDER_MAX.lm, css: CSS_FNS.lm, read: () => px(cs('row')?.getPropertyValue('--m-h')) },
  { key: 'lg', label: 'Minion gap (px)', min: 0, max: SLIDER_MAX.lg, css: CSS_FNS.lg, read: () => px(cs('row')?.columnGap) },
  { key: 'ls', label: 'Section gap (px)', min: 0, max: SLIDER_MAX.ls, css: CSS_FNS.ls, read: () => px(cs('center')?.rowGap) },
  { key: 'lw', label: 'Table max width (px)', min: 300, max: SLIDER_MAX.lw, step: 10, css: CSS_FNS.lw, read: () => px(cs('table')?.maxWidth) ?? px(String(first('table')?.offsetWidth)) },
  { key: 'lhs', label: 'Hand sink (px)', min: 0, max: SLIDER_MAX.lhs, css: CSS_FNS.lhs, read: () => px(cs('hand')?.getPropertyValue('--hand-sink')) },
  // Your hand: the cards are 144 px wide at zoom 1 (the board computes a smaller zoom to fit a big hand), so width = 144 x zoom.
  { key: 'lhw0', label: 'My hand card width (px)', min: 60, max: SLIDER_MAX.lhw0, css: CSS_FNS.lhw0, read: () => { const z = parseFloat(cs('hand')?.getPropertyValue('--hand-zoom') ?? ''); return Number.isNaN(z) ? undefined : Math.round(z * 144); } },
  // The enemy's hand: card backs (144 x 152 px by default, overlapping by 40 px each side), scaled together.
  { key: 'lhw1', label: 'Enemy hand card width (px)', min: 40, max: SLIDER_MAX.lhw1, css: CSS_FNS.lhw1, read: () => px(cs('cardBack')?.width) },
  { key: 'lfw0', label: 'My hero width (px)', min: 110, max: SLIDER_MAX.lfw0, css: CSS_FNS.lfw0, read: () => px(cs('figMe')?.width) },
  { key: 'lfw1', label: 'Enemy hero width (px)', min: 110, max: SLIDER_MAX.lfw1, css: CSS_FNS.lfw1, read: () => px(cs('figFoe')?.width) },
  // Hero figure position: an offset from where /play puts it (via the individual `translate` property, so it composes with the rest).
  { key: 'lfx0', label: 'My hero X offset (px)', min: -SLIDER_MAX.lfx0, max: SLIDER_MAX.lfx0, css: CSS_FNS.lfx0, read: () => 0 },
  { key: 'lfy0', label: 'My hero Y offset (px)', min: -SLIDER_MAX.lfy0, max: SLIDER_MAX.lfy0, css: CSS_FNS.lfy0, read: () => 0 },
  { key: 'lfx1', label: 'Enemy hero X offset (px)', min: -SLIDER_MAX.lfx1, max: SLIDER_MAX.lfx1, css: CSS_FNS.lfx1, read: () => 0 },
  { key: 'lfy1', label: 'Enemy hero Y offset (px)', min: -SLIDER_MAX.lfy1, max: SLIDER_MAX.lfy1, css: CSS_FNS.lfy1, read: () => 0 },
  // A clicked minion: how far it lifts and how much it grows (the board's own defaults are 14 px and 1.08x).
  { key: 'lml', label: 'Clicked minion lift (px)', min: 0, max: SLIDER_MAX.lml, step: 0.5, css: CSS_FNS.lml, read: () => 14 },
  { key: 'lms', label: 'Clicked minion scale (x)', min: 1, max: SLIDER_MAX.lms, step: 0.005, css: CSS_FNS.lms, read: () => 1.08 },
  // A target under the pointer while aiming: 1 = no change (a ring only).
  { key: 'lmh', label: 'Target hover scale (x)', min: 0.8, max: SLIDER_MAX.lmh, step: 0.005, css: CSS_FNS.lmh, read: () => 1 },
  // The clicked (selected) hand card: /play scales it 2x (hand zoom on top) and lifts it so it stays on screen.
  { key: 'lsel', label: 'Clicked card scale (x)', min: 1, max: SLIDER_MAX.lsel, step: 0.05, css: CSS_FNS.lsel, read: () => 2 },
  // The log and deck panels. Their presets are in `panelCss`; these are size and offset.
  { key: 'lsplit', label: 'Stacked: log share of height (%)', min: 15, max: SLIDER_MAX.lsplit, css: CSS_FNS.lsplit, read: () => 50 },
  { key: 'lgw', label: 'Log width (px)', min: 120, max: SLIDER_MAX.lgw, css: CSS_FNS.lgw, read: () => px(cs('log')?.width) },
  { key: 'ldw', label: 'Deck width (px)', min: 120, max: SLIDER_MAX.ldw, css: CSS_FNS.ldw, read: () => px(cs('deckView')?.width) },
  { key: 'lgx', label: 'Log X offset (px)', min: -SLIDER_MAX.lgx, max: SLIDER_MAX.lgx, css: CSS_FNS.lgx, read: () => 0 },
  { key: 'lgy', label: 'Log Y offset (px)', min: -SLIDER_MAX.lgy, max: SLIDER_MAX.lgy, css: CSS_FNS.lgy, read: () => 0 },
  { key: 'ldx', label: 'Deck X offset (px)', min: -SLIDER_MAX.ldx, max: SLIDER_MAX.ldx, css: CSS_FNS.ldx, read: () => 0 },
  { key: 'ldy', label: 'Deck Y offset (px)', min: -SLIDER_MAX.ldy, max: SLIDER_MAX.ldy, css: CSS_FNS.ldy, read: () => 0 },
  // The energy bar: scale and an X / Y offset from where /play puts it (just outside the table's right edge).
  { key: 'les', label: 'Energy bar scale (x)', min: 0.5, max: SLIDER_MAX.les, step: 0.05, css: CSS_FNS.les, read: () => 1 },
  { key: 'lex', label: 'Energy bar X offset (px)', min: -SLIDER_MAX.lex, max: SLIDER_MAX.lex, css: CSS_FNS.lex, read: () => 0 },
  { key: 'ley', label: 'Energy bar Y offset (px)', min: -SLIDER_MAX.ley, max: SLIDER_MAX.ley, css: CSS_FNS.ley, read: () => 0 },
  // The green overlays that show where a card from your hand can be played
  { key: 'lpoo', label: 'Overall opacity (x)', min: 0, max: 1, step: 0.05, css: CSS_FNS.lpoo, read: () => 1 },
  { key: 'lpow', label: 'Outline width (px)', min: 0, max: 8, css: CSS_FNS.lpow, read: () => 2 },
  { key: 'lpor', label: 'Corner radius (px)', min: 0, max: 40, css: CSS_FNS.lpor, read: () => 8 },
  { key: 'lpoi', label: 'Fill strength, idle (%)', min: 0, max: 100, css: CSS_FNS.lpoi, read: () => 6 },
  { key: 'lpoh', label: 'Fill strength, hovered (%)', min: 0, max: 100, css: CSS_FNS.lpoh, read: () => 18 },
  { key: 'lpog', label: 'Landing gap fill (%)', min: 0, max: 100, css: CSS_FNS.lpog, read: () => 25 },
  { key: 'lpogw', label: 'Landing gap width (px)', min: 10, max: 200, css: CSS_FNS.lpogw, read: () => 64 },
  { key: 'lpos', label: 'Dashed outline (1 = dashed, 0 = solid)', min: 0, max: 1, css: CSS_FNS.lpos, read: () => 1 },
  { key: 'lpoga', label: 'Playable hand card glow (px)', min: 0, max: 30, css: CSS_FNS.lpoga, read: () => 5 },
  { key: 'lpoao', label: 'Global: opacity (x)', min: 0, max: 1, step: 0.05, css: CSS_FNS.lpoao, read: () => 1 },
  { key: 'lpoai', label: 'Global: idle fill (%)', min: 0, max: 100, css: CSS_FNS.lpoai, read: () => 6 },
  { key: 'lpoah', label: 'Global: hover fill (%)', min: 0, max: 100, css: CSS_FNS.lpoah, read: () => 18 },
  { key: 'lpoahw', label: 'Global: hover outline width (px)', min: 0, max: 10, css: CSS_FNS.lpoahw, read: () => 2 },
  { key: 'lpoahg', label: 'Global: hover glow (px)', min: 0, max: 60, css: CSS_FNS.lpoahg, read: () => 0 },
  { key: 'lpoat', label: 'Global: hover fade (ms)', min: 0, max: 800, step: 10, css: CSS_FNS.lpoat, read: () => 100 },
  { key: 'lpozo', label: 'Minion zone: opacity (x)', min: 0, max: 1, step: 0.05, css: CSS_FNS.lpozo, read: () => 1 },
  { key: 'lpozi', label: 'Minion zone: idle fill (%)', min: 0, max: 100, css: CSS_FNS.lpozi, read: () => 6 },
  { key: 'lpozh', label: 'Minion zone: hover fill (%)', min: 0, max: 100, css: CSS_FNS.lpozh, read: () => 18 },
  { key: 'lpozhw', label: 'Minion zone: hover outline width (px)', min: 0, max: 10, css: CSS_FNS.lpozhw, read: () => 2 },
  { key: 'lpozhg', label: 'Minion zone: hover glow (px)', min: 0, max: 60, css: CSS_FNS.lpozhg, read: () => 0 },
  { key: 'lpozt', label: 'Minion zone: hover fade (ms)', min: 0, max: 800, step: 10, css: CSS_FNS.lpozt, read: () => 0 },
  { key: 'lpogo', label: 'Gap: opacity (x)', min: 0, max: 1, step: 0.05, css: CSS_FNS.lpogo, read: () => 1 },
  { key: 'lpogb', label: 'Gap: outline width (px)', min: 0, max: 10, css: CSS_FNS.lpogb, read: () => 2 },
  { key: 'lpogd', label: 'Gap: opening time (ms)', min: 0, max: 1000, step: 10, css: CSS_FNS.lpogd, read: () => 120 },
  { key: 'lpogs', label: 'Gap: starting opacity (x)', min: 0, max: 1, step: 0.05, css: CSS_FNS.lpogs, read: () => 0 },
  { key: 'lpogp', label: 'Gap: pulse, seconds per beat (0 = none)', min: 0, max: 3, step: 0.1, css: CSS_FNS.lpogp, read: () => 0 },
  { key: 'lpogq', label: 'Gap: pulse brightness (x)', min: 1, max: 3, step: 0.05, css: CSS_FNS.lpogq, read: () => 1.4 },
  { key: 'lpgw', label: 'Backdrop weave strength', min: 0, max: 0.2, step: 0.002, css: CSS_FNS.lpgw, read: () => 0.018 },
  { key: 'lpgm', label: 'Backdrop middle colour position (%)', min: 1, max: 99, css: CSS_FNS.lpgm, read: () => 52 },
  { key: 'lflt', label: 'Felt tint opacity', min: 0, max: 1, step: 0.05, css: CSS_FNS.lflt, read: () => 0.35 },
  { key: 'lfla', label: 'Felt centre glow opacity', min: 0, max: 1, step: 0.02, css: CSS_FNS.lfla, read: () => 0.16 },
  { key: 'lflra', label: 'Felt rim opacity', min: 0, max: 1, step: 0.01, css: CSS_FNS.lflra, read: () => 0.09 },
  { key: 'lflw', label: 'Felt rim width (px)', min: 0, max: 12, css: CSS_FNS.lflw, read: () => 2 },
  { key: 'lflr', label: 'Felt corner radius (px)', min: 0, max: 80, css: CSS_FNS.lflr, read: () => 22 },
  { key: 'lfli', label: 'Felt inner shadow (darkness)', min: 0, max: 1, step: 0.05, css: CSS_FNS.lfli, read: () => 0.45 },
  { key: 'lflo', label: 'Felt outer shadow (darkness)', min: 0, max: 1, step: 0.05, css: CSS_FNS.lflo, read: () => 0.35 },
  { key: 'lflx', label: 'Felt extra width each side (px)', min: -100, max: 300, css: CSS_FNS.lflx, read: () => 16 },
  { key: 'lfly', label: 'Felt extra height each side (px)', min: -100, max: 300, css: CSS_FNS.lfly, read: () => 8 },
  // Energy bar look
  { key: 'leg', label: 'Orb glow (px)', min: 0, max: 40, css: CSS_FNS.leg, read: () => 8 },
  { key: 'legt', label: 'Number glow (px)', min: 0, max: 40, css: CSS_FNS.legt, read: () => 8 },
  { key: 'lecs', label: 'Number size (x)', min: 0.5, max: 4, step: 0.05, css: CSS_FNS.lecs, read: () => 1 },
  { key: 'lecv', label: 'Show number (1 = yes, 0 = no)', min: 0, max: 1, css: CSS_FNS.lecv, read: () => 1 },
  { key: 'lect', label: 'Show "/total" (1 = yes, 0 = no)', min: 0, max: 1, css: CSS_FNS.lect, read: () => 1 },
  { key: 'lebr', label: 'Blink: seconds per pulse', min: 0.2, max: 4, step: 0.05, css: CSS_FNS.lebr, read: () => 1.2 },
  { key: 'lebb', label: 'Blink: brightness (x)', min: 1, max: 3, step: 0.05, css: CSS_FNS.lebb, read: () => 1.5 },
  { key: 'lebg', label: 'Blink: glow (px)', min: 0, max: 50, css: CSS_FNS.lebg, read: () => 14 },
  // The cast popup that flashes when a spell or item is played (defaults are what /play does).
  { key: 'lcx', label: 'Cast popup X offset (px)', min: -1000, max: 1000, css: CSS_FNS.lcx, read: () => 0 },
  { key: 'lcy', label: 'Cast popup Y offset (px)', min: -600, max: 600, css: CSS_FNS.lcy, read: () => 0 },
  { key: 'lcs', label: 'Cast popup size (x)', min: 0.4, max: 3, step: 0.05, css: CSS_FNS.lcs, read: () => 1 },
  { key: 'lcms', label: 'Cast popup length (ms)', min: 400, max: 5000, step: 50, css: CSS_FNS.lcms, read: () => 1600 },
  { key: 'lcpeak', label: 'Cast popup slam size (x)', min: 1, max: 2.5, step: 0.05, css: CSS_FNS.lcpeak, read: () => 1.3 },
  { key: 'lcglow', label: 'Cast popup glow (px, 0 = none)', min: 0, max: 60, css: CSS_FNS.lcglow, read: () => 10 },
  { key: 'lcring', label: 'Cast popup shockwave ring (1 = on, 0 = off)', min: 0, max: 1, css: CSS_FNS.lcring, read: () => 1 }
];

export const SETUP_KEYS = ['b0', 'b1', 'p0', 'p1', 'w0', 'w1', 'e0', 'e1', 'h0', 'h1', 'first', 'herofig', 'turn'];
/** The setup params that need a new game (heroes are chosen at deal time, hands are dealt). Boards and energy are applied live. */
export const RESTART_KEYS = ['p0', 'p1', 'w0', 'w1', 'h0', 'h1', 'first', 'herofig'];
export const HEROES = ['', ...heroes().map((h) => h.id), 'none'];

export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export const row = { display: 'block', margin: '6px 0' } as const;
export const wide = { display: 'block', width: '100%' } as const;

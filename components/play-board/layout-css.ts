/**
 * Layout overrides for the /play board, as CSS over the real stylesheet. The /board-lab page edits these knobs live; `/play` applies
 * `PLAY_LAYOUT` (the saved "wip" preset from the lab). Param names are the lab's URL keys (see the header comment in pages/board-lab.tsx).
 */
export const CLS = (name: string) => `[class*="play-board_${name}__"]`;
export const SLOT = '[class*="board-minion_slot__"]';
export const OVAL = '[class*="board-minion_oval__"]';
// The first minion on your own board (the one the preview lifts).
export const MY_FIRST = '[class*="play-board_center__"] > section [class*="play-board_row__"] > :first-child';
export const BAR = '[class*="energy-bar_bar__"]';
export const ORBS = '[class*="energy-bar_orbs__"]';


export const CSS_FNS: Record<string, (v: number) => string> = {
  lpsh: (v) => `${SLOT}{--port-hover:${v}}`,
  lpss: (v) => `${SLOT}{--port-sel:${v}}`,
  lpsm: (v) => `${SLOT}{--port-ms:${v}ms}`,
  lpsy: (v) => `${SLOT}{--port-oy:${v}%}`,
  lshdefy: (v) => `${SLOT}{--sh-def-y:${v}px}`,
  lshdefb: (v) => `${SLOT}{--sh-def-b:${v}px}`,
  lshdefa: (v) => `${SLOT}{--sh-def-a:${v}}`,
  lshrdyy: (v) => `${SLOT}{--sh-rdy-y:${v}px}`,
  lshrdyb: (v) => `${SLOT}{--sh-rdy-b:${v}px}`,
  lshrdya: (v) => `${SLOT}{--sh-rdy-a:${v}}`,
  lshsely: (v) => `${SLOT}{--sh-sel-y:${v}px}`,
  lshselb: (v) => `${SLOT}{--sh-sel-b:${v}px}`,
  lshsela: (v) => `${SLOT}{--sh-sel-a:${v}}`,
  lshaimy: (v) => `${SLOT}{--sh-aim-y:${v}px}`,
  lshaimb: (v) => `${SLOT}{--sh-aim-b:${v}px}`,
  lshaima: (v) => `${SLOT}{--sh-aim-a:${v}}`,
  lshhovy: (v) => `${SLOT}{--sh-hov-y:${v}px}`,
  lshhovb: (v) => `${SLOT}{--sh-hov-b:${v}px}`,
  lshhova: (v) => `${SLOT}{--sh-hov-a:${v}}`,
  lm: (v) => `${CLS('row')}{--m-h:${v}px !important}`,
  lg: (v) => `${CLS('row')}{gap:${v}px !important}`,
  ls: (v) => `${CLS('table')},${CLS('center')}{gap:${v}px !important}`,
  lw: (v) => `${CLS('table')}{max-width:${v}px !important}`,
  lhs: (v) => `${CLS('hand')}{--hand-sink:${v}px !important}`,
  lhw0: (v) => `${CLS('hand')}{--hand-zoom:${v / 144} !important}`,
  lhw1: (v) => `${CLS('cardBack')}{width:${v}px !important;height:${(v * 9.5) / 9}px !important;margin-left:${(-v * 2.5) / 9}px !important;margin-right:${(-v * 2.5) / 9}px !important}`,
  lfw0: (v) => `${CLS('figMe')}{width:${v}px !important;--figW:${v}px !important}`,
  lfw1: (v) => `${CLS('figFoe')}{width:${v}px !important;--figW:${v}px !important}`,
  lfx0: (v) => `${CLS('figMe')}{--lab-x:${v}px}`,
  lfy0: (v) => `${CLS('figMe')}{--lab-y:${v}px}`,
  lfx1: (v) => `${CLS('figFoe')}{--lab-x:${v}px}`,
  lfy1: (v) => `${CLS('figFoe')}{--lab-y:${v}px}`,
  lml: (v) => `${SLOT}{--sel-lift:${v}px}`,
  lms: (v) => `${SLOT}{--sel-scale:${v}}`,
  lmh: (v) => `${SLOT}{--aim-scale:${v}}`,
  lsel: () => '',
  lsplit: () => '',
  lgw: (v) => `${CLS('log')}{width:${v}px !important}`,
  ldw: (v) => `${CLS('deckView')}{width:${v}px !important}`,
  lgx: (v) => `${CLS('log')}{--lab-x:${v}px}`,
  lgy: (v) => `${CLS('log')}{--lab-y:${v}px}`,
  ldx: (v) => `${CLS('deckView')}{--lab-x:${v}px}`,
  ldy: (v) => `${CLS('deckView')}{--lab-y:${v}px}`,
  les: (v) => `${BAR}{scale:${v} !important}`,
  lex: (v) => `${BAR}{--lab-x:${v}px}`,
  ley: (v) => `${BAR}{--lab-y:${v}px}`,
  // Green "play this" overlays: outline width / radius, fill strength (%) idle / hovered / landing gap, gap width, dashed (1) or solid (0), hand glow.
  lpow: (v) => `${CLS('page')}{--po-w:${v}px}`,
  lpor: (v) => `${CLS('page')}{--po-r:${v}px}`,
  lpoi: (v) => `${CLS('page')}{--po-idle:${v}}`,
  lpoh: (v) => `${CLS('page')}{--po-hot:${v}}`,
  lpog: (v) => `${CLS('page')}{--po-gap:${v}}`,
  lpogw: (v) => `${CLS('page')}{--po-gapw:${v}px}`,
  lpoo: (v) => `${CLS('page')}{--po-op:${v}}`,
  lpos: (v) => (v ? '' : `${CLS('page')}{--po-style:solid}`),
  lpoga: (v) => `${CLS('page')}{--po-glow:${v}px}`,
  // Per-element play overlays: a = global cast area, z = minion zone, g = landing gap. o opacity, i idle fill, h hover fill, hw hover outline width,
  // hg hover glow, t hover fade ms. Gap: gb outline width, gd open ms, gs start opacity, gp pulse seconds (0 = off), gq pulse brightness.
  lpoao: (v) => `${CLS('page')}{--po-ao:${v}}`,
  lpoai: (v) => `${CLS('page')}{--po-ai:${v}}`,
  lpoah: (v) => `${CLS('page')}{--po-ah:${v}}`,
  lpoahw: (v) => `${CLS('page')}{--po-ahw:${v}px}`,
  lpoahg: (v) => `${CLS('page')}{--po-ahg:${v}px}`,
  lpoat: (v) => `${CLS('page')}{--po-at:${v}ms}`,
  lpozo: (v) => `${CLS('page')}{--po-zo:${v}}`,
  lpozi: (v) => `${CLS('page')}{--po-zi:${v}}`,
  lpozh: (v) => `${CLS('page')}{--po-zh:${v}}`,
  lpozhw: (v) => `${CLS('page')}{--po-zhw:${v}px}`,
  lpozhg: (v) => `${CLS('page')}{--po-zhg:${v}px}`,
  lpozt: (v) => `${CLS('page')}{--po-zt:${v}ms}`,
  lpogo: (v) => `${CLS('page')}{--po-go:${v}}`,
  lpogb: (v) => `${CLS('page')}{--po-gb-w:${v}px}`,
  lpogd: (v) => `${CLS('page')}{--po-gd:${v}ms}`,
  lpogs: (v) => `${CLS('page')}{--po-gs:${v}}`,
  lpogp: (v) => `${CLS('page')}{--po-gp:${v}s}`,
  lpogq: (v) => `${CLS('page')}{--po-gb:${v}}`,
  // Backdrop and felt panel (the area around the image): weave, middle-colour position, felt alphas, corner radius, rim, shadows, extra size.
  lpgw: (v) => `${CLS('page')}{--bg-weave:${v}}`,
  lpgm: (v) => `${CLS('page')}{--bg-mid:${v}%}`,
  lflt: (v) => `${CLS('page')}{--felt-tint-a:${v}}`,
  lfla: (v) => `${CLS('page')}{--felt-glow-a:${v}}`,
  lflra: (v) => `${CLS('page')}{--felt-rim-a:${v}}`,
  lflr: (v) => `${CLS('page')}{--felt-r:${v}px}`,
  lflw: (v) => `${CLS('page')}{--felt-rw:${v}px}`,
  lfli: (v) => `${CLS('page')}{--felt-in:${v}}`,
  lflo: (v) => `${CLS('page')}{--felt-out:${v}}`,
  lflx: (v) => `${CLS('page')}{--felt-x:${v}px}`,
  lfly: (v) => `${CLS('page')}{--felt-y:${v}px}`,
  // Energy bar look: glows, number size / visibility, blink rate / strength (colours are `ENERGY_COLOURS`, below).
  leg: (v) => `${BAR}{--en-glow:${v}px}`,
  legt: (v) => `${BAR}{--en-text-glow:${v}px}`,
  lecs: (v) => `${BAR}{--en-cs:${v}}`,
  lecv: (v) => (v ? '' : `${BAR} > b{display:none !important}`),
  lect: (v) => (v ? '' : `${BAR} > b small{display:none !important}`),
  lebr: (v) => `${BAR}{--en-br:${v}s}`,
  lebb: (v) => `${BAR}{--en-bb:${v}}`,
  lebg: (v) => `${BAR}{--en-bg:${v}px}`,
  // The cast popup (a spell or item being played): offset from its default spot, size, length, slam size, glow, shockwave ring.
  lcx: (v) => `${CLS('castFx')}{--cast-x:${v}px}`,
  lcy: (v) => `${CLS('castFx')}{--cast-y:${v}px}`,
  lcs: (v) => `${CLS('castFx')}{--cast-size:${v}}`,
  lcms: (v) => `${CLS('castFx')}{--cast-ms:${v}ms}`,
  lcpeak: (v) => `${CLS('castFx')}{--cast-peak:${v}}`,
  lcglow: (v) => `${CLS('castFx')}{--cast-glow:${v}px}`,
  lcring: (v) => (v ? '' : `${CLS('castFx')}::after{display:none !important}`),
};

/**
 * The middle strip's number knobs: one row each (URL key, label, range, default, the CSS variable it sets and its unit). The lab builds its
 * sliders from this and `CSS_FNS` its CSS, so a new knob is one line here plus the rule in play-board.module.scss.
 */
export const MID_KNOBS: { key: string; label: string; min: number; max: number; step?: number; def: number; cssVar: string; unit: string }[] = [
  // Horizontal lines (the border above and below the strip)
  { key: 'lmdlw', label: 'Lines: thickness (px)', min: 0, max: 12, def: 1, cssVar: '--mid-lw', unit: 'px' },
  { key: 'lmdla', label: 'Lines: opacity', min: 0, max: 1, step: 0.05, def: 1, cssVar: '--mid-la', unit: '' },
  { key: 'lmdlt', label: 'Lines: top line (1 = show, 0 = hide)', min: 0, max: 1, def: 1, cssVar: '--mid-lt', unit: '' },
  { key: 'lmdlb', label: 'Lines: bottom line (1 = show, 0 = hide)', min: 0, max: 1, def: 1, cssVar: '--mid-lb', unit: '' },
  // Strip spacing
  { key: 'lmdp', label: 'Strip: padding up and down (px)', min: 0, max: 80, def: 8, cssVar: '--mid-p', unit: 'px' },
  { key: 'lmdpx', label: 'Strip: padding left and right (px)', min: 0, max: 200, def: 12, cssVar: '--mid-px', unit: 'px' },
  { key: 'lmdg', label: 'Strip: gap between items (px)', min: 0, max: 120, def: 16, cssVar: '--mid-g', unit: 'px' },
  { key: 'lmdh', label: 'Strip: minimum height (px)', min: 0, max: 200, def: 0, cssVar: '--mid-h', unit: 'px' },
  // Middle text
  { key: 'lmdts', label: 'Text: size (x)', min: 0.5, max: 3, step: 0.05, def: 1, cssVar: '--mid-ts', unit: '' },
  { key: 'lmdtw', label: 'Text: weight', min: 100, max: 900, step: 100, def: 400, cssVar: '--mid-tw', unit: '' },
  { key: 'lmdto', label: 'Text: opacity', min: 0, max: 1, step: 0.05, def: 1, cssVar: '--mid-to', unit: '' },
  { key: 'lmdtl', label: 'Text: letter spacing (px)', min: -2, max: 10, step: 0.1, def: 0, cssVar: '--mid-tl', unit: 'px' },
  { key: 'lmdks', label: 'Clock: size (x)', min: 0.5, max: 3, step: 0.05, def: 1, cssVar: '--mid-ks', unit: '' },
  // End turn button
  { key: 'lmdbr', label: 'End turn: corner radius (px)', min: 0, max: 40, def: 6, cssVar: '--mid-br', unit: 'px' },
  { key: 'lmdbx', label: 'End turn: padding left and right (px)', min: 0, max: 80, def: 19, cssVar: '--mid-bx', unit: 'px' },
  { key: 'lmdby', label: 'End turn: padding up and down (px)', min: 0, max: 40, def: 8, cssVar: '--mid-by', unit: 'px' },
  { key: 'lmdbs', label: 'End turn: text size (x)', min: 0.5, max: 3, step: 0.05, def: 1, cssVar: '--mid-bs', unit: '' },
  { key: 'lmdbw', label: 'End turn: text weight', min: 100, max: 900, step: 100, def: 700, cssVar: '--mid-bw', unit: '' },
  { key: 'lmdbg', label: 'End turn: glow (px)', min: 0, max: 40, def: 0, cssVar: '--mid-bg', unit: 'px' },
  { key: 'lmdbh', label: 'End turn: brightness on hover (x)', min: 0.5, max: 2, step: 0.05, def: 1, cssVar: '--mid-bh', unit: '' },
  { key: 'lmdbd', label: 'End turn: opacity when disabled', min: 0, max: 1, step: 0.05, def: 0.4, cssVar: '--mid-bd', unit: '' },
  // Timer bar
  { key: 'lmdtb', label: 'Timer bar: show (1 = yes, 0 = no)', min: 0, max: 1, def: 1, cssVar: '--mid-tb', unit: '' },
  { key: 'lmdth', label: 'Timer bar: height (px)', min: 1, max: 60, def: 4, cssVar: '--mid-th', unit: 'px' },
  { key: 'lmdtv', label: 'Timer bar: width (1 = whole window, 0 = just the strip)', min: 0, max: 1, def: 1, cssVar: '--mid-tv', unit: '' },
  { key: 'lmdty', label: 'Timer bar: move down (px)', min: -100, max: 100, def: 0, cssVar: '--mid-ty', unit: 'px' },
  { key: 'lmdtr', label: 'Timer bar: corner radius (px)', min: 0, max: 30, def: 0, cssVar: '--mid-tr', unit: 'px' },
  { key: 'lmdtta', label: 'Timer bar: track opacity', min: 0, max: 1, step: 0.05, def: 0.25, cssVar: '--mid-tta', unit: '' },
];
MID_KNOBS.forEach((k) => (CSS_FNS[k.key] = (v) => `${CLS('page')}{${k.cssVar}:${v}${k.unit}}`));
/** The lab's preview for the timer bar: how full it is (%), since the lab has no turn clock. */
export const MID_TIMER_PREVIEW_KEY = 'lmdtpv';

/** The middle strip's text choices (`lmdj` alignment, `lmdtpos` where the timer bar sits): named, not numbers. */
const MID_JUSTIFY: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' };
const midChoicesCss = (one: (k: string) => string) =>
  [
    MID_JUSTIFY[one('lmdj')] ? `${CLS('page')}{--mid-j:${MID_JUSTIFY[one('lmdj')]}}` : '',
    one('lmdtpos') === 'top' ? `${CLS('page')}{--mid-ttop:0px;--mid-tbot:auto}` : '',
    one('lmdtpos') === 'middle' ? `${CLS('page')}{--mid-ttop:50%;--mid-tbot:auto}` : '',
  ].join('');

/** Energy bar colours: URL key -> CSS variable. Values are 6-digit hex without the `#` (so they are never mistaken for the numeric knobs). */
export const ENERGY_COLOURS: Record<string, { cssVar: string; label: string; fallback: string; target?: 'page' }> = {
  lpoc: { cssVar: '--po-c', label: 'All three (base colour)', fallback: '5fd16a', target: 'page' },
  lpoac: { cssVar: '--po-ac', label: 'Global / spell area', fallback: '5fd16a', target: 'page' },
  lpoahc: { cssVar: '--po-ahc', label: 'Global / spell area, hovered', fallback: '5fd16a', target: 'page' },
  lpozc: { cssVar: '--po-zc', label: 'Minion zone', fallback: '5fd16a', target: 'page' },
  lpozhc: { cssVar: '--po-zhc', label: 'Minion zone, hovered', fallback: '5fd16a', target: 'page' },
  lpogc: { cssVar: '--po-gc', label: 'Landing gap', fallback: '5fd16a', target: 'page' },
  lpgcb: { cssVar: '--bg-base', label: 'Page base (behind the vignette)', fallback: '14161c', target: 'page' },
  lpgc1: { cssVar: '--bg-c1', label: 'Backdrop centre', fallback: '24454a', target: 'page' },
  lpgc2: { cssVar: '--bg-c2', label: 'Backdrop middle', fallback: '162a31', target: 'page' },
  lpgc3: { cssVar: '--bg-c3', label: 'Backdrop edge', fallback: '0a1015', target: 'page' },
  lflc: { cssVar: '--felt-tint', label: 'Felt tint', fallback: '081216', target: 'page' },
  lflgc: { cssVar: '--felt-glow', label: 'Felt centre glow', fallback: '509696', target: 'page' },
  lflrc: { cssVar: '--felt-rim', label: 'Felt rim', fallback: 'ffffff', target: 'page' },
  lmdlc: { cssVar: '--mid-lc', label: 'Lines', fallback: 'afa18c', target: 'page' },
  lmdtc: { cssVar: '--mid-tc', label: 'Middle text', fallback: '372810', target: 'page' },
  lmdkc: { cssVar: '--mid-kc', label: 'Clock', fallback: 'cfd6e6', target: 'page' },
  lmdkl: { cssVar: '--mid-kl', label: 'Clock, last 10 s', fallback: 'ff7d7d', target: 'page' },
  lmdbc: { cssVar: '--mid-bc', label: 'End turn: fill', fallback: '3b6fd4', target: 'page' },
  lmdbb: { cssVar: '--mid-bb', label: 'End turn: border', fallback: '5a8cf0', target: 'page' },
  lmdbt: { cssVar: '--mid-bt', label: 'End turn: text', fallback: 'e8e8ee', target: 'page' },
  lmdtfc: { cssVar: '--mid-tfc', label: 'Timer bar: fill', fallback: '5fd16a', target: 'page' },
  lmdtlc: { cssVar: '--mid-tlc', label: 'Timer bar: fill, last 10 s', fallback: 'ff7d7d', target: 'page' },
  lmdttc: { cssVar: '--mid-ttc', label: 'Timer bar: track', fallback: '000000', target: 'page' },
  lecr: { cssVar: '--en', label: 'Orbs (and number)', fallback: '4aa3ff' },
  lecb: { cssVar: '--en-bonus', label: 'Bonus orbs', fallback: 'ffd45e' },
  lecn: { cssVar: '--en-text', label: 'Number (overrides orbs)', fallback: '4aa3ff' },
};
const energyColourCss = (one: (k: string) => string) =>
  Object.entries(ENERGY_COLOURS)
    .filter(([k]) => /^[0-9a-f]{6}$/i.test(one(k)))
    .map(([k, c]) => `${c.target === 'page' ? CLS('page') : BAR}{${c.cssVar}:#${one(k)}}`)
    .join('');

/** The landing gap's opening easing (`lpoge`): a named choice, not a number. */
export const GAP_EASINGS: Record<string, string> = {
  out: 'ease-out',
  inout: 'ease-in-out',
  linear: 'linear',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  snap: 'steps(4, end)',
};
const gapEasingCss = (one: (k: string) => string) => (GAP_EASINGS[one('lpoge')] ? `${CLS('page')}{--po-ge:${GAP_EASINGS[one('lpoge')]}}` : '');

/** The layout /play uses: the lab's "wip" preset, layout knobs only (no setup params). A `?l...` param in the /play URL overrides one. */
export const PLAY_LAYOUT: Record<string, string> = {
  ldw: '242',
  ldx: '15',
  les: '0.8',
  lex: '-1230',
  ley: '118',
  lecv: '0',
  lfw0: '235',
  lfw1: '235',
  lfx0: '-265',
  lfx1: '-265',
  lfy0: '99',
  lfy1: '-2',
  lgw: '242',
  lgx: '15',
  lgy: '9',
  lhw0: '135',
  lmh: '1.025',
  lml: '1.5',
  lpan: 'stackR',
  ls: '20',
  lsel: '1.6',
  // Minion portrait scale inside the frame: hover (1 = none), selected, speed in ms, centre from the top in %
  lpsh: '1',
  lpss: '1.1',
  lpsm: '60',
  lpsy: '45',
  lsplit: '30',
  lw: '1200',
  // Background: the paper texture on the play surface
  lbgb: '0',
  lbgd: '0.1',
  lbgf: '/images/backgrounds/paper-v1.jpg',
  // Minion drop shadows (darkness per state; the selected one is also pushed 27 px down)
  lshaima: '0.75',
  lshdefa: '0.75',
  lshhova: '0.65',
  lshrdya: '0.75',
  lshsela: '0.15',
  lshsely: '27',
  // Backdrop and felt panel (the author's 2026-11-15 "board-and-casting" preset)
  lflgc: 'ced12e',
  lflo: '0.85',
  lflrc: 'ffaa33',
  lflw: '2',
  lfly: '-44',
  lpgc1: '91592b',
  lpgc2: '2a1b09',
  lpgc3: '573905',
  // Play overlays: base colour, global-area opacity 0, minion-zone opacity 0, gap opening (570 ms, springy, pulsing every 2 s)
  // Middle strip: End turn (radius 14, glow 14, hover 1.35x, brown fill and border), timer bar (strip width, 5 px down, faint track, tan / red fill);
  // lmdtpv is only the lab's preview fill (%)
  lmdbr: '14',
  lmdbg: '14',
  lmdbh: '1.35',
  lmdtv: '0',
  lmdty: '5',
  lmdtta: '0.05',
  lmdbc: '4c4240',
  lmdbb: '3e302e',
  lmdtfc: 'c79d75',
  lmdtlc: 'e14747',
  lmdtpv: '16',
  lpoao: '0',
  lpoc: 'bdff42',
  lpogd: '570',
  lpoge: 'spring',
  lpogp: '2',
  lpoo: '1',
  lpozo: '0',
};

/**
 * The board's background image (the lab's Background section): `lbgf` the image URL (none = off), `lbgt` where it goes (`table` = the play
 * surface, the default; `page` = behind everything), `lbgm` `cover` or `tile`, `lbgs` the tile size in px, `lbgx` / `lbgy` the focus point in %,
 * `lbgd` how much it is darkened (0 to 1), `lbgb` blur in px.
 */
const backgroundCss = (one: (k: string) => string): string => {
  const file = one('lbgf');
  if (!/^\/[\w./-]+$/.test(file)) return '';
  const dark = Math.min(1, Math.max(0, one('lbgd') === '' ? 0 : +one('lbgd') || 0));
  const x = one('lbgx') === '' ? 50 : +one('lbgx') || 0;
  const y = one('lbgy') === '' ? 50 : +one('lbgy') || 0;
  const tile = one('lbgm') === 'tile';
  const size = tile ? `${Math.max(50, +one('lbgs') || 600)}px` : 'cover';
  const blur = Math.max(0, +one('lbgb') || 0);
  const image = `linear-gradient(rgba(0,0,0,${dark}),rgba(0,0,0,${dark})),url(${file}) ${x}% ${y}% / ${size} ${tile ? 'repeat' : 'no-repeat'}`;
  return one('lbgt') === 'page'
    ? `${CLS('page')}::before{inset:-24px !important;background:${image} !important;filter:blur(${blur}px)}`
    : `${CLS('table')}::before{background:${image} !important;background-origin:border-box !important;filter:blur(${blur}px)}`;
};

/** The CSS for a set of layout params (values are strings, as in a URL query). */
export const buildLayoutCss = (q: Record<string, string | undefined>): string => {
  const one = (k: string) => q[k] ?? '';
  const preset = one('lpan');
  const split = Math.min(85, Math.max(15, +one('lsplit') || 50)) / 100;
  const stackSide = (left: boolean) =>
    `${left ? 'left:1rem !important;right:auto !important' : 'right:1rem !important;left:auto !important'}`;
  const panelCss =
    preset === 'swap'
      ? `${CLS('log')}{left:auto !important;right:1rem !important}${CLS('deckView')}{right:auto !important;left:1rem !important}`
      : preset === 'stackL' || preset === 'stackR'
        ? `${CLS('log')}{${stackSide(preset === 'stackL')};top:1rem !important;bottom:auto !important;height:calc((100vh - 3rem) * ${split}) !important}` +
          `${CLS('deckView')}{${stackSide(preset === 'stackL')};top:calc(1rem + (100vh - 3rem) * ${split} + 1rem) !important;bottom:1rem !important;height:auto !important}`
        : '';
  // Offsets (hero figures and panels) ride on --lab-x / --lab-y so X and Y can be set separately.
  const offsetCss = [CLS('figMe'), CLS('figFoe'), CLS('log'), CLS('deckView'), BAR]
    .map((s) => `${s}{translate:var(--lab-x,0px) var(--lab-y,0px) !important}`)
    .join('');
  // The clicked card's size. `lpv` previews it on the first card in hand without clicking.
  const sel = Math.min(3, Math.max(1, +one('lsel') || 2));
  const selTransform = `transform:translate(var(--x),calc(var(--y-comp) + (${-(110 * sel + 5)}px + var(--hand-sink)) * var(--zoom))) rotate(0deg) scale(calc(${sel} * var(--zoom))) !important`;
  const slotSel = `${CLS('handSlot')}${CLS('slotSelected')}`;
  const selCss =
    (one('lsel') ? `${slotSel},${slotSel}:hover{${selTransform}}` : '') +
    (one('lpv') ? `${CLS('handSlot')}:nth-child(1){${selTransform};z-index:20 !important;filter:drop-shadow(0 0 8px #ffd45e) drop-shadow(0 0 3px #ffd45e) !important}` : '');
  // `lmpv` previews a clicked minion on your first one, with the same gold ring the real selection has.
  const minionPreviewCss = one('lmpv')
    ? `${MY_FIRST}{transform:translateY(calc(var(--sel-lift,14px) * -1)) scale(var(--sel-scale,1.08)) !important}` +
      `${MY_FIRST} [class*="board-minion_portrait__"]{transform:scale(var(--port-sel,1)) !important}` +
      `${MY_FIRST} ${OVAL}{border-color:#ffd45e !important;box-shadow:0 0 0 3px #ffd45e,0 0 18px rgba(255,212,94,0.7),0 var(--sh-sel-y,14px) var(--sh-sel-b,18px) rgba(0,0,0,var(--sh-sel-a,0)) !important}`
    : '';
  return [
    minionPreviewCss,
    panelCss,
    // Horizontal energy bar: the orbs were listed bottom-first for the column, so row-reverse puts the first one on the left.
    one('leo') === 'h' ? `${ORBS}{flex-direction:row-reverse !important}` : '',
    offsetCss,
    energyColourCss(one),
    gapEasingCss(one),
    midChoicesCss(one),
    selCss,
    ...Object.keys(CSS_FNS)
      .filter((k) => one(k) !== '' && !Number.isNaN(+one(k)))
      .map((k) => CSS_FNS[k](+one(k))),
    one('lfs') === 'right' ? `${CLS('figSlot')}{left:auto !important;right:0.5rem !important}` : '',
    backgroundCss(one),
    one('lfelt') === '0' ? `${CLS('table')}::before{display:none !important}` : '',
  ].join('\n');
};

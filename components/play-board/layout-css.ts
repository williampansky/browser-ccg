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
};

/** The layout /play uses: the lab's "wip" preset, layout knobs only (no setup params). A `?l...` param in the /play URL overrides one. */
export const PLAY_LAYOUT: Record<string, string> = {
  ldw: '242',
  ldx: '15',
  les: '0.8',
  lex: '-1230',
  ley: '175',
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
  lbgf: '/images/backgrounds/paper-v2.jpg',
  // Minion drop shadows (darkness per state; the selected one is also pushed 27 px down)
  lshaima: '0.75',
  lshdefa: '0.75',
  lshhova: '0.65',
  lshrdya: '0.75',
  lshsela: '0.15',
  lshsely: '27',
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
    : `${CLS('table')}::before{background:${image} !important;filter:blur(${blur}px)}`;
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
    selCss,
    ...Object.keys(CSS_FNS)
      .filter((k) => one(k) !== '' && !Number.isNaN(+one(k)))
      .map((k) => CSS_FNS[k](+one(k))),
    one('lfs') === 'right' ? `${CLS('figSlot')}{left:auto !important;right:0.5rem !important}` : '',
    backgroundCss(one),
    one('lfelt') === '0' ? `${CLS('table')}::before{display:none !important}` : '',
  ].join('\n');
};

/**
 * Layout overrides for the /play board, as CSS over the real stylesheet. The
 * /board-lab page edits these knobs live; `/play` applies
 * `PLAY_LAYOUT` (the saved "wip" preset from the lab). Param names are the
 * lab's URL keys (see the header comment in pages/board-lab.tsx).
 */
export const CLS = (name: string) => `[class*="play-board_${name}__"]`;
export const SLOT = '[class*="board-minion_slot__"]';
export const OVAL = '[class*="board-minion_oval__"]';
// The first minion on your own board (the one the preview lifts).
export const MY_FIRST =
  '[class*="play-board_center__"] > section [class*="play-board_row__"] > :first-child';
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
  // Shifts the whole board (table, hand, hero figures, energy bar: all of them
  // sit relative to the table) sideways by v px, by padding one side of the
  // page by twice that. The side panels are fixed and do not move.
  lbx: (v) =>
    `${CLS('page')}{padding-${v < 0 ? 'right' : 'left'}:calc(1rem + ${2 * Math.abs(v)}px) !important}`,
  lw: (v) => `${CLS('table')}{max-width:${v}px !important}`,
  lhs: (v) => `${CLS('hand')}{--hand-sink:${v}px !important}`,
  lhw0: (v) => `${CLS('hand')}{--hand-zoom:${v / 144} !important}`,
  lhw1: (v) =>
    `${CLS('cardBack')}{width:${v}px !important;height:${(v * 9.5) / 9}px !important;margin-left:${(-v * 2.5) / 9}px !important;margin-right:${(-v * 2.5) / 9}px !important}`,
  lfw0: (v) =>
    `${CLS('figMe')}{width:${v}px !important;--figW:${v}px !important}`,
  lfw1: (v) =>
    `${CLS('figFoe')}{width:${v}px !important;--figW:${v}px !important}`,
  // An overall size for the whole hero (figure or ring) as a percentage, via
  // the individual `scale` property so it composes with the offsets. It
  // shrinks toward the corner the hero is anchored to (see `lfs`).
  lfz0: (v) =>
    `${CLS('figMe')}{scale:${v / 100} !important;transform-origin:0 100% !important}`,
  lfz1: (v) =>
    `${CLS('figFoe')}{scale:${v / 100} !important;transform-origin:0 0 !important}`,
  lfx0: (v) => `${CLS('figMe')}{--lab-x:${v}px}`,
  lfy0: (v) => `${CLS('figMe')}{--lab-y:${v}px}`,
  lfx1: (v) => `${CLS('figFoe')}{--lab-x:${v}px}`,
  lfy1: (v) => `${CLS('figFoe')}{--lab-y:${v}px}`,
  // The ring hero display has its own offsets: the figure's were tuned for a
  // different shape and would push the ring off screen.
  lrx0: (v) => `${CLS('figMe')}{--ring-x:${v}px}`,
  lry0: (v) => `${CLS('figMe')}{--ring-y:${v}px}`,
  lrx1: (v) => `${CLS('figFoe')}{--ring-x:${v}px}`,
  lry1: (v) => `${CLS('figFoe')}{--ring-y:${v}px}`,
  lml: (v) => `${SLOT}{--sel-lift:${v}px}`,
  lms: (v) => `${SLOT}{--sel-scale:${v}}`,
  lmh: (v) => `${SLOT}{--aim-scale:${v}}`,
  lsel: () => '',
  // Hand look and feel: CSS variables on .hand (see the .handSlot block in
  // play-board.module.scss for what each one does).
  // `--h-tilt-base` is the same number kept apart, so the lab can show it as
  // the starting point of the per-count sliders.
  lhrt: (v) => `${CLS('hand')}{--h-tilt:${v};--h-tilt-base:${v}}`,
  lhdp: (v) => `${CLS('hand')}{--h-dropk:${v};--h-dropk-base:${v}}`,
  lhdc: (v) => `${CLS('hand')}{--h-curve:${v}}`,
  // Hover slot width as a % of the card spacing (100 = the slots just touch,
  // less leaves gaps, more makes them overlap); 0 turns slots off.
  lhsw: (v) =>
    v <= 0
      ? `${CLS('handSlot')}{pointer-events:auto !important}${CLS('handHits')}{display:none !important}`
      : `${CLS('hand')}{--h-slot:${v / 100}}`,
  // Edge slots reach out to the card's outer edge (0 = no, 1 = to the edge) and
  // `lhsx` px further; the hovered slot grows `lhsh` px each side.
  lhse: (v) => `${CLS('hand')}{--h-edge:${v}}`,
  lhsx: (v) => `${CLS('hand')}{--h-edge-px:${v}px}`,
  lhsh: (v) => `${CLS('hand')}{--h-hot-px:${v}px}`,
  // Preview only: draw the slots.
  lhspv: (v) =>
    v
      ? `${CLS('hand')}{--h-slot-show:rgba(255,60,60,0.18);--h-slot-outline:1px}`
      : '',
  lhol: (v) => `${CLS('hand')}{--h-overlap:${v}px;--h-overlap-base:${v}}`,
  // How long the hover waits before stepping to the next card on its way to the
  // card under the pointer (ms; 0 = jump straight there).
  lhsd: (v) => `${CLS('hand')}{--h-step-ms:${v}}`,
  lhov: (v) => `${CLS('hand')}{--h-hov:${v}}`,
  lhoy: (v) => `${CLS('hand')}{--h-lift:${-v}px}`,
  lhot: (v) => `${CLS('hand')}{--h-hovrot:${v}deg}`,
  lhom: (v) => `${CLS('hand')}{--h-hov-ms:${v}ms}`,
  lhpa: (v) => `${CLS('hand')}{--h-part1:${v}px}`,
  lhpb: (v) => `${CLS('hand')}{--h-part2:${v}px}`,
  lhpm: (v) => `${CLS('hand')}{--h-part-ms:${v}ms}`,
  lhst: (v) => `${CLS('hand')}{--h-settle:${v}ms}`,
  lhdr: (v) => `${CLS('hand')}{--h-draw:${v}ms}`,
  lhha: (v) => `${CLS('hand')}{--h-halo:${v}}`,
  lhhs: (v) => `${CLS('hand')}{--h-halo-swell:${v}}`,
  lhfl: (v) => `${CLS('hand')}{--h-flash:${v}}`,
  lhsm: (v) => `${CLS('hand')}{--h-sheen-ms:${v}ms}`,
  // Flow glow (a satisfied Combo): variables on the page, read by the card
  // face (`.flowOn`, `.flowKey` in card-face.module.scss).
  lxgh: (v) => `${CLS('page')}{--fl-h:${v}}`,
  lxga: (v) => `${CLS('page')}{--fl-peak:${v}}`,
  lxgb: (v) => `${CLS('page')}{--fl-rest:${v}}`,
  lxgo: (v) => `${CLS('page')}{--fl-op:${v}}`,
  lxgd: (v) => `${CLS('page')}{--fl-ms:${v}ms}`,
  lxgk: (v) => `${CLS('page')}{--fl-kg:${v / 100}em}`,
  lxgg: (v) => `${CLS('page')}{--fl-kb:${v}}`,
  lsplit: () => '',
  // Connected sidebar: its width and the thickness of the drag bar between log
  // and deck.
  lsbw: (v) => `${CLS('page')}{--sb-w:${v}px}`,
  lsbd: (v) => `${CLS('page')}{--sb-d:${v}px}`,
  // Connected sidebar: the whole column's height (px); without it the column
  // fills the window, 1rem in from the top and bottom.
  lsbh: (v) => `${CLS('page')}{--sb-h:${v}px}`,
  lgw: (v) => `${CLS('log')}{width:${v}px !important}`,
  ldw: (v) => `${CLS('deckView')}{width:${v}px !important}`,
  lgx: (v) => `${CLS('log')}{--lab-x:${v}px}`,
  lgy: (v) => `${CLS('log')}{--lab-y:${v}px}`,
  // Log text and turn breaks (variables read by `.logLines` and friends)
  lgfs: (v) => `${CLS('page')}{--lg-fs:${v}px}`,
  lglh: (v) => `${CLS('page')}{--lg-lh:${v}}`,
  lgpd: (v) => `${CLS('page')}{--lg-pad:${v}px}`,
  lgrd: (v) => `${CLS('page')}{--lg-r:${v}px}`,
  lggp: (v) => `${CLS('page')}{--lg-gap:${v}px}`,
  lgbw: (v) => `${CLS('page')}{--lg-brw:${v}px}`,
  lgts: (v) => `${CLS('page')}{--lg-ts:${v}}`,
  lgtw: (v) => `${CLS('page')}{--lg-tw:${v}}`,
  lgsi: (v) => `${CLS('page')}{--lg-ei:${v}em}`,
  lgtg: (v) => `${CLS('page')}{--lg-tg:${v}px}`,
  lgsw: (v) => `${CLS('page')}{--lg-sw:${v}px}`,
  lgbr: (v) => `${CLS('page')}{--lg-br:${v}px}`,
  lgbp: (v) => `${CLS('page')}{--lg-bp:${v}px}`,
  lgcm: (v) => `${CLS('page')}{--lg-cm:${v}px}`,
  lgcr: (v) => `${CLS('page')}{--lg-cr:${v}px}`,
  lgis: (v) => `${CLS('page')}{--lg-is:${v}}`,
  lgnt: (v) => `${CLS('page')}{--lg-nt:${v}}`,
  lgcw: (v) => `${CLS('page')}{--lg-cw:${v}}`,
  lgico: (v) => (v ? '' : `${CLS('logIcon')}{display:none !important}`),
  lgtu: (v) => (v ? '' : `${CLS('logTurn')}{text-transform:none !important}`),
  lgft: (v) => (v ? '' : `${CLS('page')}{--lg-font:system-ui,sans-serif}`),
  ldx: (v) => `${CLS('deckView')}{--lab-x:${v}px}`,
  ldy: (v) => `${CLS('deckView')}{--lab-y:${v}px}`,
  les: (v) => `${BAR}{scale:${v} !important}`,
  lex: (v) => `${BAR}{--lab-x:${v}px}`,
  ley: (v) => `${BAR}{--lab-y:${v}px}`,
  // Green "play this" overlays: outline width / radius, fill strength (%) idle
  // / hovered / landing gap, gap width, dashed (1) or solid (0), hand glow.
  lpow: (v) => `${CLS('page')}{--po-w:${v}px}`,
  lpor: (v) => `${CLS('page')}{--po-r:${v}px}`,
  lpoi: (v) => `${CLS('page')}{--po-idle:${v}}`,
  lpoh: (v) => `${CLS('page')}{--po-hot:${v}}`,
  lpog: (v) => `${CLS('page')}{--po-gap:${v}}`,
  lpogw: (v) => `${CLS('page')}{--po-gapw:${v}px}`,
  lpoo: (v) => `${CLS('page')}{--po-op:${v}}`,
  lpos: (v) => (v ? '' : `${CLS('page')}{--po-style:solid}`),
  lpoga: (v) => `${CLS('page')}{--po-glow:${v}px}`,
  // Per-element play overlays: a = global cast area, z = minion zone, g =
  // landing gap. o opacity, i idle fill, h hover fill, hw hover outline width,
  // hg hover glow, t hover fade ms. Gap: gb outline width, gd open ms, gs start
  // opacity, gp pulse seconds (0 = off), gq pulse brightness.
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
  // Backdrop and felt panel (the area around the image): weave, middle-colour
  // position, felt alphas, corner radius, rim, shadows, extra size.
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
  // End game screen: overlay darkness, fade-in ms, banner size (x).
  leno: (v) => `${CLS('page')}{--end-dark:${v}}`,
  lenf: (v) => `${CLS('page')}{--end-fade:${v}ms}`,
  lenol: (v) => `${CLS('page')}{--end-dark-l:${v}}`,
  lenbs: (v) => `${CLS('page')}{--end-bs:${v}}`,
  // Energy bar look: glows, number size / visibility, blink rate / strength
  // (colours are `ENERGY_COLOURS`, below).
  leg: (v) => `${BAR}{--en-glow:${v}px}`,
  legt: (v) => `${BAR}{--en-text-glow:${v}px}`,
  lecs: (v) => `${BAR}{--en-cs:${v}}`,
  lecv: (v) => (v ? '' : `${BAR} > b{display:none !important}`),
  lect: (v) => (v ? '' : `${BAR} > b small{display:none !important}`),
  lebr: (v) => `${BAR}{--en-br:${v}s}`,
  lebb: (v) => `${BAR}{--en-bb:${v}}`,
  lebg: (v) => `${BAR}{--en-bg:${v}px}`,
  // The cast popup (a spell or item being played): offset from its default
  // spot, size, length, slam size, glow, shockwave ring.
  lcx: (v) => `${CLS('castFx')}{--cast-x:${v}px}`,
  lcy: (v) => `${CLS('castFx')}{--cast-y:${v}px}`,
  lcs: (v) => `${CLS('castFx')}{--cast-size:${v}}`,
  lcms: (v) => `${CLS('castFx')}{--cast-ms:${v}ms}`,
  lcpeak: (v) => `${CLS('castFx')}{--cast-peak:${v}}`,
  lcglow: (v) => `${CLS('castFx')}{--cast-glow:${v}px}`,
  lcmw: (v) => `${CLS('chooseBackdrop')}{--choose-scale:${v}}`,
  lcmg: (v) => `${CLS('chooseBackdrop')}{--choose-gap:${v}px}`,
  lcmd: (v) =>
    `${CLS('chooseBackdrop')}{background:rgba(0,0,0,${v}) !important}`,
  lcmt: (v) => `${CLS('chooseBackdrop')}{--choose-title:${v}}`,
  lcmhs: (v) => `${CLS('chooseBackdrop')}{--choose-hover:${v}}`,
  lcmhl: (v) => `${CLS('chooseBackdrop')}{--choose-lift:${v}}`,
  lcmglow: (v) => `${CLS('chooseBackdrop')}{--choose-glow:${v}px}`,
  lcmc: (v) => (v ? '' : `${CLS('chooseCaption')}{display:none !important}`),
  lcring: (v) => (v ? '' : `${CLS('castFx')}::after{display:none !important}`),
};

/**
 * The middle strip's number knobs: one row each (URL key, label, range,
 * default, the CSS variable it sets and its unit). The lab builds its
 * sliders from this and `CSS_FNS` its CSS, so a new knob is one line here plus
 * the rule in play-board.module.scss.
 */
export const MID_KNOBS: {
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  def: number;
  cssVar: string;
  unit: string;
}[] = [
  // Horizontal lines (the border above and below the strip)
  {
    key: 'lmdlw',
    label: 'Lines: thickness (px)',
    min: 0,
    max: 12,
    def: 1,
    cssVar: '--mid-lw',
    unit: 'px',
  },
  {
    key: 'lmdla',
    label: 'Lines: opacity',
    min: 0,
    max: 1,
    step: 0.05,
    def: 1,
    cssVar: '--mid-la',
    unit: '',
  },
  {
    key: 'lmdlt',
    label: 'Lines: top line (1 = show, 0 = hide)',
    min: 0,
    max: 1,
    def: 1,
    cssVar: '--mid-lt',
    unit: '',
  },
  {
    key: 'lmdlb',
    label: 'Lines: bottom line (1 = show, 0 = hide)',
    min: 0,
    max: 1,
    def: 1,
    cssVar: '--mid-lb',
    unit: '',
  },
  // Strip spacing
  {
    key: 'lmdp',
    label: 'Strip: padding up and down (px)',
    min: 0,
    max: 80,
    def: 8,
    cssVar: '--mid-p',
    unit: 'px',
  },
  {
    key: 'lmdpx',
    label: 'Strip: padding left and right (px)',
    min: 0,
    max: 200,
    def: 12,
    cssVar: '--mid-px',
    unit: 'px',
  },
  {
    key: 'lmdg',
    label: 'Strip: gap between items (px)',
    min: 0,
    max: 120,
    def: 16,
    cssVar: '--mid-g',
    unit: 'px',
  },
  {
    key: 'lmdh',
    label: 'Strip: minimum height (px)',
    min: 0,
    max: 200,
    def: 0,
    cssVar: '--mid-h',
    unit: 'px',
  },
  // Middle text
  {
    key: 'lmdts',
    label: 'Text: size (x)',
    min: 0.5,
    max: 3,
    step: 0.05,
    def: 1,
    cssVar: '--mid-ts',
    unit: '',
  },
  {
    key: 'lmdtw',
    label: 'Text: weight',
    min: 100,
    max: 900,
    step: 100,
    def: 400,
    cssVar: '--mid-tw',
    unit: '',
  },
  {
    key: 'lmdto',
    label: 'Text: opacity',
    min: 0,
    max: 1,
    step: 0.05,
    def: 1,
    cssVar: '--mid-to',
    unit: '',
  },
  {
    key: 'lmdtl',
    label: 'Text: letter spacing (px)',
    min: -2,
    max: 10,
    step: 0.1,
    def: 0,
    cssVar: '--mid-tl',
    unit: 'px',
  },
  {
    key: 'lmdtdx',
    label: 'Text: move right (px)',
    min: -600,
    max: 600,
    def: 0,
    cssVar: '--mid-tdx',
    unit: 'px',
  },
  {
    key: 'lmdtdy',
    label: 'Text: move down (px)',
    min: -100,
    max: 100,
    def: 0,
    cssVar: '--mid-tdy',
    unit: 'px',
  },
  {
    key: 'lmdks',
    label: 'Clock: size (x)',
    min: 0.5,
    max: 3,
    step: 0.05,
    def: 1,
    cssVar: '--mid-ks',
    unit: '',
  },
  // End turn button
  {
    key: 'lmdbr',
    label: 'End turn: corner radius (px)',
    min: 0,
    max: 40,
    def: 6,
    cssVar: '--mid-br',
    unit: 'px',
  },
  {
    key: 'lmdbx',
    label: 'End turn: padding left and right (px)',
    min: 0,
    max: 80,
    def: 19,
    cssVar: '--mid-bx',
    unit: 'px',
  },
  {
    key: 'lmdby',
    label: 'End turn: padding up and down (px)',
    min: 0,
    max: 40,
    def: 8,
    cssVar: '--mid-by',
    unit: 'px',
  },
  {
    key: 'lmdbs',
    label: 'End turn: text size (x)',
    min: 0.5,
    max: 3,
    step: 0.05,
    def: 1,
    cssVar: '--mid-bs',
    unit: '',
  },
  {
    key: 'lmdbw',
    label: 'End turn: text weight',
    min: 100,
    max: 900,
    step: 100,
    def: 700,
    cssVar: '--mid-bw',
    unit: '',
  },
  {
    key: 'lmdbg',
    label: 'End turn: glow (px)',
    min: 0,
    max: 40,
    def: 0,
    cssVar: '--mid-bg',
    unit: 'px',
  },
  {
    key: 'lmdbh',
    label: 'End turn: brightness on hover (x)',
    min: 0.5,
    max: 2,
    step: 0.05,
    def: 1,
    cssVar: '--mid-bh',
    unit: '',
  },
  {
    key: 'lmdbdx',
    label: 'End turn: move right (px)',
    min: -600,
    max: 600,
    def: 0,
    cssVar: '--mid-bdx',
    unit: 'px',
  },
  {
    key: 'lmdbdy',
    label: 'End turn: move down (px)',
    min: -100,
    max: 100,
    def: 0,
    cssVar: '--mid-bdy',
    unit: 'px',
  },
  {
    key: 'lmdbd',
    label: 'End turn: opacity when disabled',
    min: 0,
    max: 1,
    step: 0.05,
    def: 0.4,
    cssVar: '--mid-bd',
    unit: '',
  },
  // Timer bar
  {
    key: 'lmdtb',
    label: 'Timer bar: show (1 = yes, 0 = no)',
    min: 0,
    max: 1,
    def: 1,
    cssVar: '--mid-tb',
    unit: '',
  },
  {
    key: 'lmdth',
    label: 'Timer bar: height (px)',
    min: 1,
    max: 60,
    def: 4,
    cssVar: '--mid-th',
    unit: 'px',
  },
  {
    key: 'lmdtv',
    label: 'Timer bar: width (1 = whole window, 0 = just the strip)',
    min: 0,
    max: 1,
    def: 1,
    cssVar: '--mid-tv',
    unit: '',
  },
  {
    key: 'lmdty',
    label: 'Timer bar: move down (px)',
    min: -100,
    max: 100,
    def: 0,
    cssVar: '--mid-ty',
    unit: 'px',
  },
  {
    key: 'lmdtr',
    label: 'Timer bar: corner radius (px)',
    min: 0,
    max: 30,
    def: 0,
    cssVar: '--mid-tr',
    unit: 'px',
  },
  {
    key: 'lmdtta',
    label: 'Timer bar: track opacity',
    min: 0,
    max: 1,
    step: 0.05,
    def: 0.25,
    cssVar: '--mid-tta',
    unit: '',
  },
];
// Fan tilt for one hand size: `lhrt1` .. `lhrt10` (x) override the main tilt
// (`lhrt`) while the hand holds exactly that many cards.
for (let n = 1; n <= 10; n++)
  CSS_FNS[`lhrt${n}`] = (v) =>
    `${CLS('hand')}[data-count="${n}"]{--h-tilt:${v}}`;
// And the card overlap (the spacing): `lhol1` .. `lhol10`.
for (let n = 1; n <= 10; n++)
  CSS_FNS[`lhol${n}`] = (v) =>
    `${CLS('hand')}[data-count="${n}"]{--h-overlap:${v}px}`;
// The same for the fan drop: `lhdp1` .. `lhdp10` override the main drop
// (`lhdp`) for exactly that many cards.
for (let n = 1; n <= 10; n++)
  CSS_FNS[`lhdp${n}`] = (v) =>
    `${CLS('hand')}[data-count="${n}"]{--h-dropk:${v}}`;
MID_KNOBS.forEach(
  (k) => (CSS_FNS[k.key] = (v) => `${CLS('page')}{${k.cssVar}:${v}${k.unit}}`),
);
/**
 * The lab's preview for the timer bar: how full it is (%), since the lab has no
 * turn clock.
 */
export const MID_TIMER_PREVIEW_KEY = 'lmdtpv';

/**
 * The middle strip's text choices (`lmdj` alignment, `lmdtpos` where the timer
 * bar sits): named, not numbers.
 */
const MID_JUSTIFY: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
};
/** Where the End turn button (`lmdba`) and the status text (`lmdta`) sit along the strip, each on its own: left (the default), center or right.
 *  Left and right stay in the flow (right is an auto margin, after the others); center takes the item out of the flow and puts it on the
 *  strip's exact middle, so it does not depend on what else is in the strip. */
const MID_ALIGN: Record<string, string> = {
  left: '--mid-%o:0;--mid-%l:0px;--mid-%p:static;--mid-%sx:0px;--mid-%sy:0px',
  right: '--mid-%o:2;--mid-%l:auto;--mid-%p:static;--mid-%sx:0px;--mid-%sy:0px',
  center:
    '--mid-%o:0;--mid-%l:0px;--mid-%p:absolute;--mid-%sx:-50%;--mid-%sy:-50%',
};
const midAlignCss = (which: 'bp' | 'tp', value: string) =>
  MID_ALIGN[value]
    ? `${CLS('page')}{${MID_ALIGN[value].replace(/%(sx|sy|o|l|p)/g, `${which}$1`)}}`
    : '';
const midChoicesCss = (one: (k: string) => string) =>
  [
    midAlignCss('bp', one('lmdba')),
    midAlignCss('tp', one('lmdta')),
    MID_JUSTIFY[one('lmdj')]
      ? `${CLS('page')}{--mid-j:${MID_JUSTIFY[one('lmdj')]}}`
      : '',
    one('lmdtpos') === 'top'
      ? `${CLS('page')}{--mid-ttop:0px;--mid-tbot:auto}`
      : '',
    one('lmdtpos') === 'middle'
      ? `${CLS('page')}{--mid-ttop:50%;--mid-tbot:auto}`
      : '',
  ].join('');

/**
 * Energy bar colours: URL key -> CSS variable. Values are 6-digit hex without
 * the `#` (so they are never mistaken for the numeric knobs).
 */
export const ENERGY_COLOURS: Record<
  string,
  { cssVar: string; label: string; fallback: string; target?: 'page' }
> = {
  lpoc: {
    cssVar: '--po-c',
    label: 'All three (base colour)',
    fallback: '5fd16a',
    target: 'page',
  },
  lpoac: {
    cssVar: '--po-ac',
    label: 'Global / spell area',
    fallback: '5fd16a',
    target: 'page',
  },
  lpoahc: {
    cssVar: '--po-ahc',
    label: 'Global / spell area, hovered',
    fallback: '5fd16a',
    target: 'page',
  },
  lpozc: {
    cssVar: '--po-zc',
    label: 'Minion zone',
    fallback: '5fd16a',
    target: 'page',
  },
  lpozhc: {
    cssVar: '--po-zhc',
    label: 'Minion zone, hovered',
    fallback: '5fd16a',
    target: 'page',
  },
  lpogc: {
    cssVar: '--po-gc',
    label: 'Landing gap',
    fallback: '5fd16a',
    target: 'page',
  },
  lpgcb: {
    cssVar: '--bg-base',
    label: 'Page base (behind the vignette)',
    fallback: '14161c',
    target: 'page',
  },
  lpgc1: {
    cssVar: '--bg-c1',
    label: 'Backdrop centre',
    fallback: '24454a',
    target: 'page',
  },
  lpgc2: {
    cssVar: '--bg-c2',
    label: 'Backdrop middle',
    fallback: '162a31',
    target: 'page',
  },
  lpgc3: {
    cssVar: '--bg-c3',
    label: 'Backdrop edge',
    fallback: '0a1015',
    target: 'page',
  },
  lflc: {
    cssVar: '--felt-tint',
    label: 'Felt tint',
    fallback: '081216',
    target: 'page',
  },
  lflgc: {
    cssVar: '--felt-glow',
    label: 'Felt centre glow',
    fallback: '509696',
    target: 'page',
  },
  lflrc: {
    cssVar: '--felt-rim',
    label: 'Felt rim',
    fallback: 'ffffff',
    target: 'page',
  },
  lmdlc: {
    cssVar: '--mid-lc',
    label: 'Lines',
    fallback: 'afa18c',
    target: 'page',
  },
  lmdtc: {
    cssVar: '--mid-tc',
    label: 'Middle text',
    fallback: '372810',
    target: 'page',
  },
  lmdkc: {
    cssVar: '--mid-kc',
    label: 'Clock',
    fallback: 'cfd6e6',
    target: 'page',
  },
  lmdkl: {
    cssVar: '--mid-kl',
    label: 'Clock, last 10 s',
    fallback: 'ff7d7d',
    target: 'page',
  },
  lmdbc: {
    cssVar: '--mid-bc',
    label: 'End turn: fill',
    fallback: '3b6fd4',
    target: 'page',
  },
  lmdbb: {
    cssVar: '--mid-bb',
    label: 'End turn: border',
    fallback: '5a8cf0',
    target: 'page',
  },
  lmdbt: {
    cssVar: '--mid-bt',
    label: 'End turn: text',
    fallback: 'e8e8ee',
    target: 'page',
  },
  lmdtfc: {
    cssVar: '--mid-tfc',
    label: 'Timer bar: fill',
    fallback: '5fd16a',
    target: 'page',
  },
  lmdtlc: {
    cssVar: '--mid-tlc',
    label: 'Timer bar: fill, last 10 s',
    fallback: 'ff7d7d',
    target: 'page',
  },
  lmdttc: {
    cssVar: '--mid-ttc',
    label: 'Timer bar: track',
    fallback: '000000',
    target: 'page',
  },
  lenlc: {
    cssVar: '--end-lc',
    label: 'Loss: banner colour',
    fallback: 'ff7b7b',
    target: 'page',
  },
  lenbc: {
    cssVar: '--end-bc',
    label: 'Win: banner colour',
    fallback: 'ffd45e',
    target: 'page',
  },
  lgbg: {
    cssVar: '--lg-bg',
    label: 'Log: background',
    fallback: '1b1e27',
    target: 'page',
  },
  lgfg: {
    cssVar: '--lg-fg',
    label: 'Log: text',
    fallback: 'e6e6e6',
    target: 'page',
  },
  lgsc: {
    cssVar: '--lg-sc',
    label: 'Log: result line text',
    fallback: 'a9b0c4',
    target: 'page',
  },
  lgtc: {
    cssVar: '--lg-tc',
    label: 'Log: turn header text',
    fallback: 'e6e6e6',
    target: 'page',
  },
  lgtbg: {
    cssVar: '--lg-tbg',
    label: 'Log: turn header background',
    fallback: '202430',
    target: 'page',
  },
  lgcd: {
    cssVar: '--lg-c-damage',
    label: 'Chip: damage',
    fallback: 'e5534b',
    target: 'page',
  },
  lgch: {
    cssVar: '--lg-c-heal',
    label: 'Chip: heal',
    fallback: '4cc26b',
    target: 'page',
  },
  lgca: {
    cssVar: '--lg-c-armor',
    label: 'Chip: armor',
    fallback: '6ea8fe',
    target: 'page',
  },
  lgcx: {
    cssVar: '--lg-c-death',
    label: 'Chip: death',
    fallback: '9aa0a6',
    target: 'page',
  },
  lgcb: {
    cssVar: '--lg-c-buff',
    label: 'Chip: buff',
    fallback: 'e3b341',
    target: 'page',
  },
  lgcu: {
    cssVar: '--lg-c-debuff',
    label: 'Chip: debuff',
    fallback: 'c084fc',
    target: 'page',
  },
  lgnc: {
    cssVar: '--lg-nc',
    label: 'Log: dim notes (1 left, now 4/4)',
    fallback: '8c94a8',
    target: 'page',
  },
  lgbb: {
    cssVar: '--lg-bb',
    label: 'Log: action block background',
    fallback: '23262f',
    target: 'page',
  },
  lgbc: {
    cssVar: '--lg-brc',
    label: 'Log: line above a turn',
    fallback: '2a2e3b',
    target: 'page',
  },
  lgcc: {
    cssVar: '--lg-cc',
    label: 'Log: card names (overrides side colour)',
    fallback: 'e6e6e6',
    target: 'page',
  },
  lecr: { cssVar: '--en', label: 'Orbs (and number)', fallback: '4aa3ff' },
  lecb: { cssVar: '--en-bonus', label: 'Bonus orbs', fallback: 'ffd45e' },
  lecn: {
    cssVar: '--en-text',
    label: 'Number (overrides orbs)',
    fallback: '4aa3ff',
  },
};
const energyColourCss = (one: (k: string) => string) =>
  Object.entries(ENERGY_COLOURS)
    .filter(([k]) => /^[0-9a-f]{6}$/i.test(one(k)))
    .map(
      ([k, c]) =>
        `${c.target === 'page' ? CLS('page') : BAR}{${c.cssVar}:#${one(k)}}`,
    )
    .join('');

/** The landing gap's opening easing (`lpoge`): a named choice, not a number. */
export const GAP_EASINGS: Record<string, string> = {
  out: 'ease-out',
  inout: 'ease-in-out',
  linear: 'linear',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  snap: 'steps(4, end)',
};
const gapEasingCss = (one: (k: string) => string) =>
  GAP_EASINGS[one('lpoge')]
    ? `${CLS('page')}{--po-ge:${GAP_EASINGS[one('lpoge')]}}`
    : '';

/**
 * The layout /play uses: the lab's "wip" preset, layout knobs only (no setup
 * params). A `?l...` param in the /play URL overrides one.
 */
export const PLAY_LAYOUT: Record<string, string> = {
  ldw: '260',
  lbx: '50',
  ldx: '0',
  les: '0.8',
  lex: '-1095',
  ley: '-68',
  lecv: '0',
  lfw0: '235',
  lfw1: '235',
  lfx0: '-265',
  lfx1: '-265',
  lfy0: '99',
  lfy1: '-2',
  lrx0: '-114',
  lry0: '138',
  lrx1: '-98',
  lry1: '12',
  lgw: '310',
  lgx: '2',
  lgy: '-4',
  lhw0: '126',
  lmh: '1.025',
  lml: '1.5',
  lpan: 'default',
  ls: '8',
  lsel: '1.85',
  // Minion portrait scale inside the frame: hover (1 = none), selected, speed
  // in ms, centre from the top in %
  lpsh: '1',
  lpss: '1.1',
  lpsm: '60',
  lpsy: '45',
  lsplit: '30',
  lw: '1000',
  // Background: the paper texture on the play surface
  lbgb: '0',
  lbgd: '0.1',
  lbgf: '/images/backgrounds/paper-v1.jpg',
  // Minion drop shadows (darkness per state; the selected one is also pushed 27
  // px down)
  lshaima: '0.75',
  lshdefa: '0.75',
  lshhova: '0.65',
  lshrdya: '0.75',
  lshsela: '0.15',
  lshsely: '27',
  // Backdrop and felt panel (the author's 2026-11-15 "board-and-casting"
  // preset)
  lflgc: 'ced12e',
  lflo: '0.85',
  lflrc: 'ffaa33',
  lflw: '2',
  lfly: '-44',
  lpgc1: '91592b',
  lpgc2: '2a1b09',
  lpgc3: '573905',
  // Play overlays: base colour, global-area opacity 0, minion-zone opacity 0,
  // gap opening (570 ms, springy, pulsing every 2 s)
  // Middle strip: End turn (radius 14, glow 14, hover 1.35x, brown fill and
  // border), timer bar (strip width, 5 px down, faint track, tan / red fill);
  // lmdtpv is only the lab's preview fill (%)
  lmdbr: '8',
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
  // End game screen: overlay darkness (win .75, loss .5), 200 ms fade, banner
  // size 1 (the confetti defaults are END_DEFAULTS)
  leno: '0.75',
  lenf: '200',
  lenbs: '1',
  lenol: '0.5',
  lpoao: '0',
  lpoc: 'bdff42',
  lpogd: '570',
  lpoge: 'spring',
  lpogp: '2',
  lpoo: '1',
  lpozo: '0',
  lg: '10',
  lhw1: '140',
  lm: '110',
  lmdp: '8',
  lmdto: '0.85',
  lmdts: '0.9',
  lpoah: '68',
  lpoahg: '28',
  lhol: '70',
  lhrt: '1.25',
  lhdp: '2',
  lhs: '46',
  lhoy: '120',
  lcx: '-202',
  lcs: '1.15',
  lcpeak: '1.35',
  lcy: '36',
  lmdj: 'between',
  lmdba: 'right',
  lhdc: '0.85',
  lhsh: '20',
  lhse: '1',
  lhsx: '20',
  lhdp1: '0',
  lhdp2: '0.4',
  lhrt2: '0.2',
  lhdp3: '0.75',
  lhrt3: '0.55',
  lhrt4: '0.85',
  lhdp4: '1.25',
  lhrt5: '1',
  lhdp5: '1.5',
  lhdp6: '1.75',
  lhol2: '6',
  lhol3: '12',
  lhol4: '18',
  lhol5: '22',
  lhol6: '32',
  lhol7: '48',
  lhol8: '56',
  lhol9: '64',
  lhsd: '10',
  lsbd: '18',
  lsbw: '320',
  lsbh: '840',
  lcmw: '1.5',
  lcmg: '24',
  lcmglow: '14',
  lcmc: '0',
  lgft: '0',
  lgbp: '8',
  lggp: '8',
  lgbw: '0',
  lgts: '1.2',
  lgtu: '1',
  lgtg: '30',
  lxgh: '315',
  lxga: '12',
  lxgd: '2400',
  lxgk: '50',
  lswt: '1400',
  lswi: '700',
  lswl: '600',
  lswk: '55',
  lswh: '140',
  lswsb: '12',
};

export type LayoutTier = 'large' | 'medium' | 'small';

export const LAYOUT_TIERS: LayoutTier[] = ['large', 'medium', 'small'];

/**
 * Medium applies in a window this narrow or narrower (a tablet, a small laptop
 * window). Small is a phone and has no query: `PhoneFit` lays a phone's page
 * out at least 1200 px wide and scales it down, so no width query would match
 * it. `PlayLayout` detects the phone itself (`use-is-phone.ts`).
 */
export const MEDIUM_MEDIA = '(max-width: 1100px)';

/**
 * Knobs that differ on smaller screens, written by `npm run board -- --tier=`.
 * Only the differences go here; a tier also keeps the ones of the tier above
 * it (small inherits medium's).
 */
export const PLAY_LAYOUT_TIERS: Record<
  Exclude<LayoutTier, 'large'>,
  Record<string, string>
> = {
  medium: {},
  small: {
    lrx1: '-381',
    lry1: '-25',
    lfz1: '100',
    lfz0: '150',
    lbx: '0',
    lrx0: '-410',
    lry0: '199',
    lhs: '75',
    lhw0: '160',
    leo: 'h',
    ley: '-170',
    lex: '-1342',
    les: '1',
    lg: '20',
  },
};

/**
 * The saved knobs one tier uses: the base, then each tier's overrides down to
 * and including this one.
 */
export const layoutForTier = (tier: LayoutTier): Record<string, string> => {
  const { medium, small } = PLAY_LAYOUT_TIERS;
  if (tier === 'large') return { ...PLAY_LAYOUT };
  if (tier === 'medium') return { ...PLAY_LAYOUT, ...medium };
  return { ...PLAY_LAYOUT, ...medium, ...small };
};

/**
 * What a tier's value for a knob would be without its own override: the
 * next tier up's, so the lab can say where a value comes from.
 */
export const inheritedFrom = (
  tier: LayoutTier,
  key: string,
): LayoutTier | null => {
  if (tier === 'large') return null;
  const own = PLAY_LAYOUT_TIERS[tier][key] !== undefined;
  if (own) return tier;
  if (tier === 'small' && PLAY_LAYOUT_TIERS.medium[key] !== undefined)
    return 'medium';
  return 'large';
};

/**
 * The board's background image (the lab's Background section): `lbgf` the image
 * URL (none = off), `lbgt` where it goes (`table` = the play
 * surface, the default; `page` = behind everything), `lbgm` `cover` or `tile`,
 * `lbgs` the tile size in px, `lbgx` / `lbgy` the focus point in %,
 * `lbgd` how much it is darkened (0 to 1), `lbgb` blur in px.
 */
const backgroundCss = (one: (k: string) => string): string => {
  const file = one('lbgf');
  if (!/^\/[\w./-]+$/.test(file)) return '';
  const dark = Math.min(
    1,
    Math.max(0, one('lbgd') === '' ? 0 : +one('lbgd') || 0),
  );
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

/**
 * The CSS for a set of layout params (values are strings, as in a URL query).
 */
export const buildLayoutCss = (
  q: Record<string, string | undefined>,
): string => {
  const one = (k: string) => q[k] ?? '';
  const preset = one('lpan');
  const split = Math.min(85, Math.max(15, +one('lsplit') || 50)) / 100;
  const stackSide = (left: boolean) =>
    `${left ? 'left:1rem !important;right:auto !important' : 'right:1rem !important;left:auto !important'}`;
  // The connected sidebar: log over deck in one column on the left (`joinL`) or
  // right (`joinR`), flush, with a drag bar between them. The split
  // is the dragged one (--side-drag, set by the drag bar and remembered) or
  // else `lsplit`.
  const join = preset === 'joinL' || preset === 'joinR';
  const cut = `var(--side-drag, ${split})`;
  // One offset moves the whole column: the log's (`lgx` / `lgy`), shared by the
  // deck and the drag bar so they never come apart.
  const sbx = +one('lgx') || 0;
  const sby = +one('lgy') || 0;
  const col = 'var(--sb-h, calc(100vh - 2rem))';
  const joinCss = join
    ? `${CLS('log')}{${stackSide(preset === 'joinL')};top:1rem !important;bottom:auto !important;width:var(--sb-w,242px) !important;height:calc(${col} * ${cut} - var(--sb-d,12px) / 2) !important}` +
      `${CLS('deckView')}{${stackSide(preset === 'joinL')};top:calc(1rem + ${col} * ${cut} + var(--sb-d,12px) / 2) !important;bottom:auto !important;height:calc(${col} * (1 - ${cut}) - var(--sb-d,12px) / 2) !important;width:var(--sb-w,242px) !important;--lab-x:${sbx}px !important;--lab-y:${sby}px !important}` +
      `${CLS('sideDivider')}{display:flex !important;${stackSide(preset === 'joinL')};top:calc(1rem + ${col} * ${cut} - var(--sb-d,12px) / 2) !important;width:var(--sb-w,242px) !important;height:var(--sb-d,12px) !important;translate:${sbx}px ${sby}px !important}`
    : '';
  const panelCss = join
    ? joinCss
    : preset === 'swap'
      ? `${CLS('log')}{left:auto !important;right:1rem !important}${CLS('deckView')}{right:auto !important;left:1rem !important}`
      : preset === 'stackL' || preset === 'stackR'
        ? `${CLS('log')}{${stackSide(preset === 'stackL')};top:1rem !important;bottom:auto !important;height:calc((100vh - 3rem) * ${split}) !important}` +
          `${CLS('deckView')}{${stackSide(preset === 'stackL')};top:calc(1rem + (100vh - 3rem) * ${split} + 1rem) !important;bottom:1rem !important;height:auto !important}`
        : '';
  // Offsets (hero figures and panels) ride on --lab-x / --lab-y so X and Y can
  // be set separately.
  const offsetCss =
    [CLS('figMe'), CLS('figFoe'), CLS('log'), CLS('deckView'), BAR]
      .map(
        (s) => `${s}{translate:var(--lab-x,0px) var(--lab-y,0px) !important}`,
      )
      .join('') +
    `${CLS('figSlotRing')}{translate:var(--ring-x,0px) var(--ring-y,0px) !important}`;
  // The clicked card's size. `lpv` previews it on the first card in hand
  // without clicking.
  const sel = Math.min(3, Math.max(1, +one('lsel') || 2));
  const selTransform = `transform:translate(var(--x),calc(var(--y-comp) + (${-(110 * sel + 5)}px + var(--hand-sink)) * var(--zoom))) rotate(0deg) scale(calc(${sel} * var(--zoom))) !important`;
  const slotSel = `${CLS('handSlot')}${CLS('slotSelected')}`;
  const selCss =
    (one('lsel') ? `${slotSel},${slotSel}:hover{${selTransform}}` : '') +
    (one('lpv')
      ? `${CLS('handSlot')}:nth-child(1){${selTransform};z-index:20 !important;filter:drop-shadow(0 0 8px #ffd45e) drop-shadow(0 0 3px #ffd45e) !important}`
      : '');
  // `lmpv` previews a clicked minion on your first one, with the same gold ring
  // the real selection has.
  const minionPreviewCss = one('lmpv')
    ? `${MY_FIRST}{transform:translateY(calc(var(--sel-lift,14px) * -1)) scale(var(--sel-scale,1.08)) !important}` +
      `${MY_FIRST} [class*="board-minion_portrait__"]{transform:scale(var(--port-sel,1)) !important}` +
      `${MY_FIRST} ${OVAL}{border-color:#ffd45e !important;box-shadow:0 0 0 3px #ffd45e,0 0 18px rgba(255,212,94,0.7),0 var(--sh-sel-y,14px) var(--sh-sel-b,18px) rgba(0,0,0,var(--sh-sel-a,0)) !important}`
    : '';
  return [
    minionPreviewCss,
    panelCss,
    // Horizontal energy bar: the orbs were listed bottom-first for the column,
    // so row-reverse puts the first one on the left.
    one('leo') === 'h' ? `${ORBS}{flex-direction:row-reverse !important}` : '',
    offsetCss,
    energyColourCss(one),
    gapEasingCss(one),
    midChoicesCss(one),
    selCss,
    ...Object.keys(CSS_FNS)
      .filter((k) => one(k) !== '' && !Number.isNaN(+one(k)))
      // The connected sidebar has one width (`lsbw`); the separate log and deck
      // widths would win over it (same weight, later), so they sit out.
      .filter((k) => !(join && (k === 'lgw' || k === 'ldw')))
      .map((k) => CSS_FNS[k](+one(k))),
    one('lfs') === 'right'
      ? `${CLS('figSlot')}{left:auto !important;right:0.5rem !important}` +
        `${CLS('figMe')}{transform-origin:100% 100% !important}` +
        `${CLS('figFoe')}{transform-origin:100% 0 !important}`
      : '',
    ['solid', 'dashed', 'dotted', 'double'].includes(one('lgbs'))
      ? `${CLS('page')}{--lg-brs:${one('lgbs')}}`
      : '',
    backgroundCss(one),
    one('lfelt') === '0'
      ? `${CLS('table')}::before{display:none !important}`
      : '',
  ].join('\n');
};

/**
 * The page's layout CSS: the base, then a `@media` block for medium. On a phone
 * the small tier's CSS comes last with no query, so it wins. `resolve` gives
 * the params for a tier (so the caller can lay its own overrides on top).
 */
export const buildTieredLayoutCss = (
  resolve: (tier: LayoutTier) => Record<string, string | undefined>,
  isPhone: boolean,
): string => {
  const base = buildLayoutCss(resolve('large'));
  const medium = `@media ${MEDIUM_MEDIA}{${buildLayoutCss(resolve('medium'))}}`;
  const small = isPhone ? buildLayoutCss(resolve('small')) : '';

  return [base, medium, small].join('\n');
};

/**
 * The end-of-game confetti (canvas-confetti). Everything about it is a setting,
 * so the board lab's "End game" tab can tune it live:
 * `settingsFromQuery` reads the lab's `len*` URL params, `setEndTuning` hands
 * them to the board, and `fireEndConfetti` shoots it.
 * With no tuning, /play uses `END_DEFAULTS`.
 */
export interface EndSettings {
  on: boolean;
  /** Fire for every game end, or only when the viewer won */
  when: 'all' | 'win';
  /**
   * `burst`: one shot from (x, y); `sides`: two cannons from the left and right
   * edges
   */
  mode: 'burst' | 'sides';
  palette: 'default' | 'gold' | 'fire' | 'ice';
  count: number;
  spread: number;
  /** Where the burst starts, % of the window from the left / top */
  x: number;
  y: number;
  /** Direction in degrees (90 = straight up); only for `burst` */
  angle: number;
  velocity: number;
  gravity: number;
  decay: number;
  /** How long a piece lives (frames) */
  ticks: number;
  /** Piece size, 1 = normal */
  scalar: number;
  bursts: number;
  gapMs: number;
  delayMs: number;
}

export const END_DEFAULTS: EndSettings = {
  on: true,
  when: 'win',
  mode: 'burst',
  palette: 'default',
  count: 460,
  spread: 190,
  x: 50,
  y: 60,
  angle: 90,
  velocity: 60,
  gravity: 0.7,
  decay: 0.9,
  ticks: 340,
  scalar: 1,
  bursts: 1,
  gapMs: 250,
  delayMs: 100,
};

type NumField = {
  [K in keyof EndSettings]: EndSettings[K] extends number ? K : never;
}[keyof EndSettings];
/** The number knobs: URL key, which setting it is, and the slider range. */
export const END_KNOBS: {
  key: string;
  field: NumField;
  label: string;
  min: number;
  max: number;
  step?: number;
}[] = [
  {
    key: 'lenn',
    field: 'count',
    label: 'Pieces per burst',
    min: 0,
    max: 600,
    step: 10,
  },
  {
    key: 'lens',
    field: 'spread',
    label: 'Spread (degrees)',
    min: 5,
    max: 360,
    step: 5,
  },
  { key: 'lenx', field: 'x', label: 'Start X (% from left)', min: 0, max: 100 },
  { key: 'leny', field: 'y', label: 'Start Y (% from top)', min: 0, max: 100 },
  {
    key: 'lena',
    field: 'angle',
    label: 'Direction (90 = up)',
    min: 0,
    max: 360,
    step: 5,
  },
  { key: 'lenv', field: 'velocity', label: 'Launch speed', min: 5, max: 100 },
  {
    key: 'leng',
    field: 'gravity',
    label: 'Gravity (x)',
    min: 0,
    max: 3,
    step: 0.05,
  },
  {
    key: 'lend',
    field: 'decay',
    label: 'Slow-down (lower = stops sooner)',
    min: 0.5,
    max: 1,
    step: 0.01,
  },
  {
    key: 'lent',
    field: 'ticks',
    label: 'Lifetime (frames, 60 = 1 s)',
    min: 20,
    max: 600,
    step: 10,
  },
  {
    key: 'lenz',
    field: 'scalar',
    label: 'Piece size (x)',
    min: 0.3,
    max: 3,
    step: 0.1,
  },
  { key: 'lenb', field: 'bursts', label: 'Number of bursts', min: 1, max: 8 },
  {
    key: 'lenbg',
    field: 'gapMs',
    label: 'Gap between bursts (ms)',
    min: 50,
    max: 2000,
    step: 50,
  },
  {
    key: 'lenl',
    field: 'delayMs',
    label: 'Wait before the first burst (ms)',
    min: 0,
    max: 3000,
    step: 50,
  },
];

const PALETTES: Record<EndSettings['palette'], string[] | undefined> = {
  default: undefined,
  gold: ['#ffd45e', '#ffb300', '#fff1b8'],
  fire: ['#ff5d5d', '#ff9a3c', '#ffd45e'],
  ice: ['#4aa3ff', '#bfe1ff', '#ffffff'],
};

export const settingsFromQuery = (one: (k: string) => string): EndSettings => {
  const out: EndSettings = { ...END_DEFAULTS };
  END_KNOBS.forEach((k) => {
    const v = one(k.key);
    if (v !== '' && !Number.isNaN(+v)) out[k.field] = +v;
  });
  out.on = one('lenon') !== '0';
  if (one('lenw') === 'all') out.when = 'all';
  else if (one('lenw') === 'win') out.when = 'win';
  if (one('lenm') === 'sides') out.mode = 'sides';
  const p = one('lenp') as EndSettings['palette'];
  if (p in PALETTES) out.palette = p;
  return out;
};

let current: EndSettings = END_DEFAULTS;
/** The board lab sets this from its URL; /play never does. */
export const setEndTuning = (s: EndSettings | undefined) => {
  current = s ?? END_DEFAULTS;
};

/**
 * Shoots the confetti (skipped when it is off, for a loss when set to wins
 * only, or with reduced motion).
 */
export const fireEndConfetti = async (
  viewerWon: boolean,
  s: EndSettings = current,
) => {
  if (typeof window === 'undefined' || !s.on || s.count <= 0) return;
  if (s.when === 'win' && !viewerWon) return;
  const confetti = (await import('canvas-confetti')).default;
  const base = {
    spread: s.spread,
    startVelocity: s.velocity,
    gravity: s.gravity,
    decay: s.decay,
    ticks: s.ticks,
    scalar: s.scalar,
    colors: PALETTES[s.palette],
    disableForReducedMotion: true,
  };
  const shoot = () => {
    if (s.mode === 'sides') {
      void confetti({
        ...base,
        particleCount: Math.ceil(s.count / 2),
        angle: 60,
        origin: { x: 0, y: s.y / 100 },
      });
      void confetti({
        ...base,
        particleCount: Math.floor(s.count / 2),
        angle: 120,
        origin: { x: 1, y: s.y / 100 },
      });
    } else {
      void confetti({
        ...base,
        particleCount: s.count,
        angle: s.angle,
        origin: { x: s.x / 100, y: s.y / 100 },
      });
    }
  };
  for (let i = 0; i < s.bursts; i++)
    window.setTimeout(shoot, s.delayMs + i * s.gapMs);
};

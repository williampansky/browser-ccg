import { PLAY_LAYOUT } from './layout-css';

/**
 * The numbers behind an attack swing (`swingFrames` in motion.ts): one set for
 * a hero (`lsw...` URL params) and one for a minion (`lnw...`). The board
 * lab's Animations tab edits them; `npm run board` bakes them into
 * `PLAY_LAYOUT`, which is what /play reads.
 */
export interface HeroSwingSettings {
  /** The whole swing, from the first lift to being settled at rest */
  totalMs: number;
  /** When the slam lands on the target (the shake, numbers and sound follow) */
  impactMs: number;
  /** When the lift is done and the hero starts to hang */
  liftMs: number;
  /** How long the final dash at the target takes, before the impact */
  slamMs: number;
  /** How long the hero stays pressed into the target after the hit */
  holdMs: number;
  /** How far up (px) the hero rises */
  liftY: number;
  /** How big the hero gets at the top, 1 = normal */
  liftScale: number;
  /** How big it is on impact */
  hitScale: number;
  /** The fraction of the way to the target centre that it reaches */
  reach: number;
  /** The vertical scale of the settle squash, 1 = none */
  squash: number;
  /** The shadow when lifted: how far down (px), how soft (px), how dark */
  shadowY: number;
  shadowBlur: number;
  shadowAlpha: number;
}

type NumField = keyof HeroSwingSettings;

/** One slider: its URL key, which setting it sets and its range. */
export interface SwingKnob {
  key: string;
  field: NumField;
  label: string;
  min: number;
  max: number;
  step?: number;
}

type KnobSpec = Omit<SwingKnob, 'key'> & { suffix: string };

/** The sliders, with each URL key made from a prefix and the suffix. */
const KNOB_SPECS: KnobSpec[] = [
  {
    suffix: 't',
    field: 'totalMs',
    label: 'Whole swing (ms)',
    min: 300,
    max: 2500,
    step: 10,
  },
  {
    suffix: 'i',
    field: 'impactMs',
    label: 'Impact lands at (ms)',
    min: 100,
    max: 1500,
    step: 10,
  },
  {
    suffix: 'l',
    field: 'liftMs',
    label: 'Lift finishes at (ms)',
    min: 50,
    max: 1000,
    step: 10,
  },
  {
    suffix: 'k',
    field: 'slamMs',
    label: 'Slam dash (ms before impact)',
    min: 30,
    max: 400,
    step: 5,
  },
  {
    suffix: 'h',
    field: 'holdMs',
    label: 'Hold on contact (ms)',
    min: 0,
    max: 400,
    step: 5,
  },
  { suffix: 'y', field: 'liftY', label: 'Lift height (px)', min: 0, max: 100 },
  {
    suffix: 's',
    field: 'liftScale',
    label: 'Lift size (x)',
    min: 1,
    max: 1.6,
    step: 0.01,
  },
  {
    suffix: 'x',
    field: 'hitScale',
    label: 'Impact size (x)',
    min: 0.8,
    max: 1.5,
    step: 0.01,
  },
  {
    suffix: 'r',
    field: 'reach',
    label: 'Reach (fraction of the way to the target)',
    min: 0.3,
    max: 1.1,
    step: 0.01,
  },
  {
    suffix: 'q',
    field: 'squash',
    label: 'Settle squash (vertical scale)',
    min: 0.8,
    max: 1,
    step: 0.01,
  },
  {
    suffix: 'sy',
    field: 'shadowY',
    label: 'Lifted shadow distance (px)',
    min: 0,
    max: 80,
  },
  {
    suffix: 'sb',
    field: 'shadowBlur',
    label: 'Lifted shadow softness (px)',
    min: 0,
    max: 50,
  },
  {
    suffix: 'sa',
    field: 'shadowAlpha',
    label: 'Lifted shadow darkness',
    min: 0,
    max: 1,
    step: 0.01,
  },
];

/** A hero is heavy: a slow lift, a long hang, a hard slam. */
const HERO_BASE: HeroSwingSettings = {
  totalMs: 900,
  impactMs: 420,
  liftMs: 270,
  slamMs: 90,
  holdMs: 70,
  liftY: 22,
  liftScale: 1.16,
  hitScale: 1.1,
  reach: 0.85,
  squash: 0.96,
  shadowY: 26,
  shadowBlur: 16,
  shadowAlpha: 0.3,
};

/** A minion is lighter and quicker, with a smaller lift. */
const MINION_BASE: HeroSwingSettings = {
  totalMs: 680,
  impactMs: 300,
  liftMs: 170,
  slamMs: 70,
  holdMs: 50,
  liftY: 14,
  liftScale: 1.12,
  hitScale: 1.1,
  reach: 0.82,
  squash: 0.97,
  shadowY: 16,
  shadowBlur: 12,
  shadowAlpha: 0.32,
};

/**
 * A set of swing settings with its own URL keys: the sliders, the defaults,
 * the reader for URL-style values, and what the board uses right now (the
 * lab's tuning if it has set any, else the defaults with the baked
 * `PLAY_LAYOUT` values on top).
 */
const makeSwing = (prefix: string, base: HeroSwingSettings) => {
  const knobs: SwingKnob[] = KNOB_SPECS.map(({ suffix, ...rest }) => ({
    ...rest,
    key: `${prefix}${suffix}`,
  }));
  const fromQuery = (
    read: (key: string) => string | undefined,
  ): HeroSwingSettings => {
    const out = { ...base };
    knobs.forEach((knob) => {
      const value = read(knob.key);
      if (value !== undefined && value !== '' && !Number.isNaN(+value))
        out[knob.field] = +value;
    });
    return out;
  };
  let tuned: HeroSwingSettings | undefined;
  return {
    knobs,
    defaults: base,
    fromQuery,
    setTuning: (settings: HeroSwingSettings | undefined): void => {
      tuned = settings;
    },
    get: (): HeroSwingSettings => tuned ?? fromQuery((key) => PLAY_LAYOUT[key]),
  };
};

export type SwingKind = 'hero' | 'minion';

export const SWINGS = {
  hero: makeSwing('lsw', HERO_BASE),
  minion: makeSwing('lnw', MINION_BASE),
};

export const getSwing = (kind: SwingKind): HeroSwingSettings =>
  SWINGS[kind].get();

export const HERO_SWING_KNOBS = SWINGS.hero.knobs;
export const HERO_SWING_DEFAULTS = SWINGS.hero.defaults;
export const swingFromQuery = SWINGS.hero.fromQuery;
export const setHeroSwingTuning = SWINGS.hero.setTuning;
export const getHeroSwing = SWINGS.hero.get;
export const MINION_SWING_KNOBS = SWINGS.minion.knobs;
export const MINION_SWING_DEFAULTS = SWINGS.minion.defaults;
export const minionSwingFromQuery = SWINGS.minion.fromQuery;
export const setMinionSwingTuning = SWINGS.minion.setTuning;
export const getMinionSwing = SWINGS.minion.get;

import { PLAY_LAYOUT } from './layout-css';

/**
 * The numbers behind a hero's attack swing (`heroSwingFrames` in motion.ts).
 * The board lab's Animations tab edits them through `lsw...` URL params;
 * `npm run board` bakes those into `PLAY_LAYOUT`, which is what /play reads.
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

/** The number knobs: URL key, which setting it is, and the slider range. */
export const HERO_SWING_KNOBS: {
  key: string;
  field: NumField;
  label: string;
  min: number;
  max: number;
  step?: number;
  fallback: number;
}[] = [
  {
    key: 'lswt',
    field: 'totalMs',
    label: 'Whole swing (ms)',
    min: 300,
    max: 2500,
    step: 10,
    fallback: 900,
  },
  {
    key: 'lswi',
    field: 'impactMs',
    label: 'Impact lands at (ms)',
    min: 100,
    max: 1500,
    step: 10,
    fallback: 420,
  },
  {
    key: 'lswl',
    field: 'liftMs',
    label: 'Lift finishes at (ms)',
    min: 50,
    max: 1000,
    step: 10,
    fallback: 270,
  },
  {
    key: 'lswk',
    field: 'slamMs',
    label: 'Slam dash (ms before impact)',
    min: 30,
    max: 400,
    step: 5,
    fallback: 90,
  },
  {
    key: 'lswh',
    field: 'holdMs',
    label: 'Hold on contact (ms)',
    min: 0,
    max: 400,
    step: 5,
    fallback: 70,
  },
  {
    key: 'lswy',
    field: 'liftY',
    label: 'Lift height (px)',
    min: 0,
    max: 100,
    fallback: 22,
  },
  {
    key: 'lsws',
    field: 'liftScale',
    label: 'Lift size (x)',
    min: 1,
    max: 1.6,
    step: 0.01,
    fallback: 1.16,
  },
  {
    key: 'lswx',
    field: 'hitScale',
    label: 'Impact size (x)',
    min: 0.8,
    max: 1.5,
    step: 0.01,
    fallback: 1.1,
  },
  {
    key: 'lswr',
    field: 'reach',
    label: 'Reach (fraction of the way to the target)',
    min: 0.3,
    max: 1.1,
    step: 0.01,
    fallback: 0.85,
  },
  {
    key: 'lswq',
    field: 'squash',
    label: 'Settle squash (vertical scale)',
    min: 0.8,
    max: 1,
    step: 0.01,
    fallback: 0.96,
  },
  {
    key: 'lswsy',
    field: 'shadowY',
    label: 'Lifted shadow distance (px)',
    min: 0,
    max: 80,
    fallback: 26,
  },
  {
    key: 'lswsb',
    field: 'shadowBlur',
    label: 'Lifted shadow softness (px)',
    min: 0,
    max: 50,
    fallback: 16,
  },
  {
    key: 'lswsa',
    field: 'shadowAlpha',
    label: 'Lifted shadow darkness',
    min: 0,
    max: 1,
    step: 0.01,
    fallback: 0.3,
  },
];

const defaultsOf = (): HeroSwingSettings => {
  const out = {} as HeroSwingSettings;
  HERO_SWING_KNOBS.forEach((knob) => {
    out[knob.field] = knob.fallback;
  });
  return out;
};

export const HERO_SWING_DEFAULTS: HeroSwingSettings = defaultsOf();

/**
 * The settings for a set of URL-style values: a knob with no value keeps its
 * default.
 */
export const swingFromQuery = (
  read: (key: string) => string | undefined,
): HeroSwingSettings => {
  const out = { ...HERO_SWING_DEFAULTS };
  HERO_SWING_KNOBS.forEach((knob) => {
    const value = read(knob.key);
    if (value !== undefined && value !== '' && !Number.isNaN(+value))
      out[knob.field] = +value;
  });
  return out;
};

/** What /play uses: the defaults with the baked `PLAY_LAYOUT` values on top. */
const baked = (): HeroSwingSettings =>
  swingFromQuery((key) => PLAY_LAYOUT[key]);

let tuned: HeroSwingSettings | undefined;

/** The board lab sets this from its URL; /play never does. */
export const setHeroSwingTuning = (
  settings: HeroSwingSettings | undefined,
): void => {
  tuned = settings;
};

export const getHeroSwing = (): HeroSwingSettings => tuned ?? baked();

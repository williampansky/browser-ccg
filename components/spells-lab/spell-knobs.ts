import type { SpellFxKind } from '../play-board/spell-fx';
import { SPELL_FX_SPRITES } from '../play-board/spell-fx-sprites';
import type { SpellFxTune } from '../play-board/spell-fx-tune';

type KeyOf<T> = {
  [K in keyof SpellFxTune]: SpellFxTune[K] extends T ? K : never;
}[keyof SpellFxTune];
type NumKey = KeyOf<number>;
type ChoiceKey =
  | 'areaDirection'
  | 'areaFall'
  | 'areaRegion'
  | 'areaStyle'
  | 'spotAnchor'
  | 'strikeStyle'
  | 'spotRingsMotion'
  | 'spotSparkMotion'
  | 'sprite';
type ColourKey = Exclude<KeyOf<string>, ChoiceKey>;
type FlagKey = KeyOf<boolean>;

export interface SpellKnob {
  field: NumKey;
  /** Show the slider only while this holds (a knob that needs 2+ rings) */
  when?: (tune: SpellFxTune) => boolean;
  label: string;
  min: number;
  max: number;
  step?: number;
}

export interface SpellChoice {
  field: ChoiceKey;
  label: string;
  options: { value: string; label: string }[];
}

export interface SpellGroup {
  title: string;
  /** The bases that can use this group; the lab shows it only for those */
  kinds: SpellFxKind[];
  /** Hide the whole group while this is false (the orb's look with a picture) */
  when?: (tune: SpellFxTune) => boolean;
  /**
   * An option that switches the group on: its sliders and colours show only
   * while the box is ticked (the box itself always shows).
   */
  flag?: { field: FlagKey; label: string };
  knobs: SpellKnob[];
  colours?: { field: ColourKey; label: string }[];
  /** Pick-one options (a word, not a number); shown above the sliders */
  choices?: SpellChoice[];
}

const PICTURE_CHOICE: SpellChoice = {
  field: 'sprite',
  label: 'Picture',
  options: SPELL_FX_SPRITES.map((art) => ({ value: art.id, label: art.label })),
};

/** The picture's size, turn and spin: every base that shows one has these. */
const PICTURE_SHAPE: SpellKnob[] = [
  { field: 'spriteSize', label: 'Size (px)', min: 16, max: 192 },
  {
    field: 'spriteTurn',
    label: 'Turn (degrees, if it points off)',
    min: -180,
    max: 180,
  },
  {
    field: 'spriteSpin',
    label: 'Spin (degrees per second, 0 = point first)',
    min: -1440,
    max: 1440,
    step: 10,
  },
];

/** How a thrown or dropped picture lands, sticks and fades. */
const PICTURE_LANDING: SpellKnob[] = [
  {
    field: 'spriteDepth',
    label: 'How far the point sinks in (px)',
    min: -20,
    max: 40,
  },
  {
    field: 'spriteScatter',
    label: 'Lands off-centre by up to (px)',
    min: 0,
    max: 60,
  },
  {
    field: 'spriteStick',
    label: 'Stays stuck for (ms)',
    min: 0,
    max: 2000,
    step: 10,
  },
  {
    field: 'spriteFade',
    label: 'Then fades over (ms)',
    min: 0,
    max: 2000,
    step: 10,
  },
];

/**
 * The spells lab's sections. Each value lives in the URL as `s_<field>`. A
 * section appears only for the bases that can use it, and an option's numbers
 * only appear while it is on, so a base never shows a knob it cannot use.
 */
export const SPELL_GROUPS: SpellGroup[] = [
  {
    title: 'Flight',
    kinds: ['travel'],
    knobs: [
      {
        field: 'travelMs',
        label: 'Flight time (ms)',
        min: 80,
        max: 1200,
        step: 10,
      },
      {
        field: 'travelArc',
        label: 'Sideways bow (fraction of length)',
        min: 0,
        max: 0.4,
        step: 0.01,
      },
      {
        field: 'travelEase',
        label: 'Speed-up (1 = steady)',
        min: 0.5,
        max: 4,
        step: 0.1,
      },
    ],
  },
  {
    title: 'Orb',
    kinds: ['travel'],
    when: (tune) => !tune.travelHasSprite,
    colours: [{ field: 'travelColour', label: 'Glow colour' }],
    knobs: [
      {
        field: 'travelHaloScale',
        label: 'Glow size',
        min: 0.3,
        max: 3,
        step: 0.05,
      },
      {
        field: 'travelCoreScale',
        label: 'White core size',
        min: 0.1,
        max: 2,
        step: 0.05,
      },
      { field: 'travelPulse', label: 'Pulse', min: 0, max: 0.6, step: 0.01 },
      {
        field: 'travelStretch',
        label: 'Stretch along the flight (1 = round)',
        min: 1,
        max: 8,
        step: 0.1,
      },
    ],
  },
  {
    title: 'Streamers',
    kinds: ['travel'],
    flag: {
      field: 'travelHasStreamers',
      label: 'Flailing streamers off the head',
    },
    colours: [{ field: 'travelStreamerColour', label: 'Streamer colour' }],
    knobs: [
      { field: 'travelStreamerCount', label: 'How many', min: 1, max: 16 },
      {
        field: 'travelStreamerLength',
        label: 'Length (px)',
        min: 30,
        max: 500,
      },
      {
        field: 'travelStreamerWave',
        label: 'Wave sideways (px)',
        min: 0,
        max: 150,
      },
      {
        field: 'travelStreamerFlail',
        label: 'Flail speed',
        min: 0.1,
        max: 6,
        step: 0.1,
      },
      {
        field: 'travelStreamerSpread',
        label: 'Fan out at the tips (px)',
        min: 0,
        max: 200,
      },
      {
        field: 'travelStreamerWidth',
        label: 'Width at the base (px)',
        min: 1,
        max: 20,
        step: 0.5,
      },
      {
        field: 'travelStreamerAlpha',
        label: 'Opacity',
        min: 0.05,
        max: 1,
        step: 0.05,
      },
      {
        field: 'travelStreamerGrow',
        label: 'Grow out over (ms, 0 = appear at once)',
        min: 0,
        max: 1500,
        step: 10,
      },
      {
        field: 'travelStreamerLinger',
        label: 'Keep flailing after the hit (ms)',
        min: 0,
        max: 1500,
        step: 10,
      },
    ],
  },
  {
    title: 'Picture',
    kinds: ['travel'],
    flag: {
      field: 'travelHasSprite',
      label: 'Fly a picture instead of the orb',
    },
    choices: [PICTURE_CHOICE],
    knobs: [...PICTURE_SHAPE, ...PICTURE_LANDING],
  },
  {
    title: 'Picture',
    kinds: ['strike'],
    flag: {
      field: 'strikeHasSprite',
      label: 'Drop a picture instead of the bolt',
    },
    choices: [PICTURE_CHOICE],
    knobs: [...PICTURE_SHAPE, ...PICTURE_LANDING],
  },
  {
    title: 'Picture',
    kinds: ['spot'],
    flag: { field: 'spotHasSprite', label: 'Show a picture at the spot' },
    choices: [PICTURE_CHOICE],
    knobs: [
      ...PICTURE_SHAPE,
      {
        field: 'spotSpriteRise',
        label: 'Rises by (px)',
        min: -80,
        max: 160,
      },
    ],
  },
  {
    title: 'Trail',
    kinds: ['travel'],
    flag: { field: 'travelHasTrail', label: 'Leave a trail' },
    colours: [{ field: 'travelTrailColour', label: 'Trail colour' }],
    knobs: [
      {
        field: 'travelTrailPerFrame',
        label: 'Puffs per frame',
        min: 1,
        max: 8,
      },
      {
        field: 'travelTrailLife',
        label: 'Puff life (ms)',
        min: 60,
        max: 900,
        step: 10,
      },
      {
        field: 'travelTrailScale',
        label: 'Puff size',
        min: 0.1,
        max: 1.5,
        step: 0.05,
      },
      { field: 'travelTrailSpread', label: 'Scatter (px)', min: 0, max: 24 },
      {
        field: 'travelTrailDrift',
        label: 'Drift speed',
        min: 0,
        max: 0.2,
        step: 0.005,
      },
    ],
  },
  {
    title: 'Style and angle',
    kinds: ['strike'],
    choices: [
      {
        field: 'strikeStyle',
        label: 'Style',
        options: [
          { value: 'lightning', label: 'Lightning (a jagged bolt)' },
          { value: 'beam', label: 'Beam (a straight shaft of light)' },
        ],
      },
    ],
    knobs: [
      {
        field: 'strikeAngle',
        label: 'Lean from straight down (degrees; + from upper left)',
        min: -75,
        max: 75,
      },
      {
        field: 'strikeBeamGrow',
        label: 'Beam reaches the target in (ms, 0 = at once)',
        min: 0,
        max: 800,
        step: 10,
        when: (tune) => tune.strikeStyle === 'beam',
      },
    ],
  },
  {
    title: 'Timing',
    kinds: ['strike'],
    knobs: [
      {
        field: 'strikeMs',
        label: 'Charge-up before the hit (ms)',
        min: 0,
        max: 800,
        step: 10,
      },
      {
        field: 'strikeLife',
        label: 'Bolt lasts (ms)',
        min: 80,
        max: 900,
        step: 10,
      },
      {
        field: 'strikeReroll',
        label: 'Re-forms every (ms)',
        min: 30,
        max: 400,
        step: 5,
        when: (tune) => tune.strikeStyle === 'lightning',
      },
      {
        field: 'strikeDropout',
        label: 'Flicker (chance a frame dims)',
        min: 0,
        max: 1,
        step: 0.05,
        when: (tune) => tune.strikeStyle === 'lightning',
      },
    ],
  },
  {
    title: 'Bolt',
    kinds: ['strike'],
    colours: [{ field: 'strikeColour', label: 'Bolt colour' }],
    knobs: [
      {
        field: 'strikeWidth',
        label: 'Thickness',
        min: 0.3,
        max: 8,
        step: 0.05,
      },
      {
        field: 'strikeSegments',
        label: 'Bends',
        min: 3,
        max: 30,
        when: (tune) => tune.strikeStyle === 'lightning',
      },
      {
        field: 'strikeJitter',
        label: 'Kick of each bend (px)',
        min: 0,
        max: 100,
        when: (tune) => tune.strikeStyle === 'lightning',
      },
      {
        field: 'strikeSway',
        label: 'Start off to the side (px)',
        min: 0,
        max: 400,
      },
      {
        field: 'strikeGlowScale',
        label: 'Charge-up glow size',
        min: 0,
        max: 8,
        step: 0.1,
      },
    ],
  },
  {
    title: 'Forks',
    kinds: ['strike'],
    when: (tune) => !tune.strikeHasSprite,
    flag: { field: 'strikeHasForks', label: 'Side forks' },
    knobs: [
      { field: 'strikeBranches', label: 'Forks', min: 1, max: 8 },
      {
        field: 'strikeBranchReach',
        label: 'Fork reach (px)',
        min: 20,
        max: 400,
      },
    ],
  },
  {
    title: 'Screen flash',
    kinds: ['strike'],
    flag: { field: 'strikeHasFlash', label: 'Flash the screen' },
    knobs: [
      {
        field: 'strikeScreenFlash',
        label: 'Strength',
        min: 0.02,
        max: 1,
        step: 0.01,
      },
    ],
  },
  {
    title: 'Where it plays',
    kinds: ['spot'],
    choices: [
      {
        field: 'spotAnchor',
        label: 'Plays on',
        options: [
          { value: 'target', label: "The spell's target (or your hero)" },
          { value: 'enemy-minions', label: 'Every enemy minion' },
          { value: 'my-minions', label: 'Every minion of yours' },
          { value: 'all-minions', label: 'Every minion on the board' },
        ],
      },
    ],
    knobs: [
      {
        field: 'spotStagger',
        label: 'Delay from one minion to the next (ms)',
        min: 0,
        max: 400,
        step: 5,
        when: (tune) => tune.spotAnchor !== 'target',
      },
    ],
  },
  {
    title: 'Rings',
    kinds: ['spot'],
    choices: [
      {
        field: 'spotRingsMotion',
        label: 'Rings move',
        options: [
          { value: 'out', label: 'Open outward' },
          { value: 'in', label: 'Close inward' },
          { value: 'pulse', label: 'Pulse in place' },
          { value: 'descend', label: 'Close while sliding down' },
        ],
      },
    ],
    colours: [
      { field: 'spotColour', label: 'First ring colour' },
      { field: 'spotAccentColour', label: 'Later rings colour' },
    ],
    knobs: [
      {
        field: 'spotLife',
        label: 'Each ring opens in (ms)',
        min: 100,
        max: 1500,
        step: 10,
      },
      { field: 'spotRadius', label: 'Reach (px)', min: 30, max: 400 },
      {
        field: 'spotDescendStart',
        label: 'Starts above the spot (px)',
        min: 0,
        max: 300,
        when: (tune) => tune.spotRingsMotion === 'descend',
      },
      {
        field: 'spotDescendEnd',
        label: 'Ends below the spot (px)',
        min: 0,
        max: 300,
        when: (tune) => tune.spotRingsMotion === 'descend',
      },
      {
        field: 'spotRingSquash',
        label: 'Height (1 = round, lower = flat halo)',
        min: 0.1,
        max: 1,
        step: 0.05,
      },
      { field: 'spotRings', label: 'Rings', min: 1, max: 5 },
      {
        field: 'spotRingGap',
        label: 'Gap between rings (ms)',
        min: 0,
        max: 400,
        step: 5,
      },
      {
        field: 'spotWidth',
        label: 'Line thickness (px)',
        min: 1,
        max: 20,
        step: 0.5,
      },
      {
        field: 'spotSides',
        label: 'Corners (6 = hexagon, 48 = circle)',
        min: 3,
        max: 48,
      },
      {
        field: 'spotRingBlur',
        label: 'Softness (blur px, 0 = crisp)',
        min: 0,
        max: 20,
        step: 0.5,
      },
      {
        field: 'spotRingBlurStep',
        label: 'Extra blur for each later ring (px)',
        min: -10,
        max: 10,
        step: 0.5,
        when: (tune) => tune.spotRings > 1,
      },
      {
        field: 'spotFillAlpha',
        label: 'Tint inside the rings',
        min: 0,
        max: 0.6,
        step: 0.01,
      },
    ],
  },
  {
    title: 'Glow',
    kinds: ['spot'],
    flag: { field: 'spotHasGlow', label: 'Soft glow behind' },
    knobs: [
      {
        field: 'spotGlowScale',
        label: 'Glow size',
        min: 0.5,
        max: 8,
        step: 0.1,
      },
    ],
  },
  {
    title: 'Sparks',
    kinds: ['spot'],
    flag: { field: 'spotHasSparks', label: 'Sparks' },
    choices: [
      {
        field: 'spotSparkMotion',
        label: 'Sparks go',
        options: [
          { value: 'outward', label: 'Outward' },
          { value: 'rising', label: 'Rising (drifting motes)' },
          { value: 'inward', label: 'Inward' },
        ],
      },
    ],
    knobs: [
      { field: 'spotSparkCount', label: 'Sparks', min: 1, max: 60 },
      {
        field: 'spotSparkSpeed',
        label: 'Speed (px per ms)',
        min: 0.02,
        max: 0.6,
        step: 0.01,
      },
      {
        field: 'spotSparkLife',
        label: 'Life (ms)',
        min: 100,
        max: 1500,
        step: 10,
      },
      {
        field: 'spotSparkScale',
        label: 'Size',
        min: 0.1,
        max: 1.5,
        step: 0.05,
      },
      {
        field: 'spotSparkSpread',
        label: 'Start scatter (px; 0 = one point)',
        min: 0,
        max: 200,
      },
    ],
  },
  {
    title: 'Spark colour',
    kinds: ['spot'],
    when: (tune) => tune.spotHasSparks,
    flag: { field: 'spotHasSparkColour', label: 'Choose the spark colour' },
    colours: [{ field: 'spotSparkColour', label: 'Spark colour' }],
    knobs: [],
  },
  {
    title: 'Region and timing',
    kinds: ['area'],
    choices: [
      {
        field: 'areaRegion',
        label: 'Covers',
        options: [
          { value: 'enemy', label: "The enemy's side" },
          { value: 'mine', label: 'Your side' },
          { value: 'both', label: 'Both sides' },
        ],
      },
    ],
    knobs: [
      {
        field: 'areaMs',
        label: 'Plays for (ms)',
        min: 200,
        max: 4000,
        step: 10,
      },
      {
        field: 'areaImpactMs',
        label: 'Damage lands after (ms)',
        min: 0,
        max: 3000,
        step: 10,
      },
      {
        field: 'areaPad',
        label: 'Extends past the minions by (px)',
        min: 0,
        max: 300,
      },
    ],
  },
  {
    title: 'Look',
    kinds: ['area'],
    choices: [
      {
        field: 'areaStyle',
        label: 'Style',
        options: [
          { value: 'swirl', label: 'Swirl (a cyclone)' },
          { value: 'sweep', label: 'Sweep (a wave front)' },
          { value: 'shockwave', label: 'Shockwave (rings from the middle)' },
          { value: 'rain', label: 'Rain (drops falling or rising)' },
        ],
      },
    ],
    colours: [
      { field: 'areaColour', label: 'Body colour' },
      { field: 'areaAccentColour', label: 'Bright edge and embers' },
    ],
    knobs: [
      {
        field: 'areaBlur',
        label: 'Softness (blur px, 0 = crisp)',
        min: 0,
        max: 24,
        step: 0.5,
      },
      { field: 'areaEmbers', label: 'Embers per second', min: 0, max: 300 },
    ],
  },
  {
    title: 'Swirl',
    kinds: ['area'],
    when: (tune) => tune.areaStyle === 'swirl',
    knobs: [
      { field: 'areaArms', label: 'Arms', min: 1, max: 8 },
      {
        field: 'areaTurns',
        label: 'Turns of each arm',
        min: 0.2,
        max: 4,
        step: 0.1,
      },
      {
        field: 'areaSpin',
        label: 'Spin (turns per second)',
        min: -3,
        max: 3,
        step: 0.1,
      },
      { field: 'areaWidth', label: 'Band width (px)', min: 4, max: 120 },
    ],
  },
  {
    title: 'Sweep',
    kinds: ['area'],
    when: (tune) => tune.areaStyle === 'sweep',
    choices: [
      {
        field: 'areaDirection',
        label: 'Runs',
        options: [
          { value: 'right', label: 'Left to right' },
          { value: 'left', label: 'Right to left' },
          { value: 'out', label: 'Out from the middle' },
        ],
      },
    ],
    knobs: [
      { field: 'areaWaveWidth', label: 'Wave width (px)', min: 20, max: 400 },
    ],
  },
  {
    title: 'Shockwave',
    kinds: ['area'],
    when: (tune) => tune.areaStyle === 'shockwave',
    knobs: [
      { field: 'areaRings', label: 'Rings', min: 1, max: 6 },
      {
        field: 'areaRingGap',
        label: 'Gap between rings (ms)',
        min: 0,
        max: 600,
        step: 10,
      },
      { field: 'areaWidth', label: 'Ring thickness (px)', min: 2, max: 120 },
    ],
  },
  {
    title: 'Rain',
    kinds: ['area'],
    when: (tune) => tune.areaStyle === 'rain',
    choices: [
      {
        field: 'areaFall',
        label: 'Moves',
        options: [
          { value: 'down', label: 'Falling' },
          { value: 'up', label: 'Rising (a surge)' },
        ],
      },
    ],
    knobs: [
      { field: 'areaDrops', label: 'Drops per second', min: 10, max: 1200 },
      {
        field: 'areaDropSpeed',
        label: 'Speed (px per ms)',
        min: 0.1,
        max: 2,
        step: 0.05,
      },
      {
        field: 'areaDropScale',
        label: 'Drop size',
        min: 0.1,
        max: 1.5,
        step: 0.05,
      },
    ],
  },
  {
    title: 'Shake and flash',
    kinds: ['area'],
    flag: { field: 'areaHasFlash', label: 'Flash the screen' },
    knobs: [
      {
        field: 'areaFlash',
        label: 'Flash strength',
        min: 0.02,
        max: 1,
        step: 0.01,
      },
      {
        field: 'areaShake',
        label: 'Table shake (0 = none)',
        min: 0,
        max: 8,
        step: 0.5,
      },
    ],
  },
  {
    title: 'Volley',
    kinds: ['travel', 'strike', 'spot', 'area'],
    knobs: [
      {
        field: 'volleyCount',
        label: 'Animations per target',
        min: 1,
        max: 10,
      },
      {
        field: 'volleyDelay',
        label: 'Delay between each (ms)',
        min: 0,
        max: 600,
        step: 5,
      },
    ],
  },
  {
    title: 'Impact sparks',
    kinds: ['travel', 'strike', 'area'],
    knobs: [
      { field: 'burstCount', label: 'Sparks', min: 0, max: 60 },
      {
        field: 'burstLife',
        label: 'Spark life (ms)',
        min: 80,
        max: 1200,
        step: 10,
      },
      {
        field: 'burstScale',
        label: 'Spark size',
        min: 0.1,
        max: 2,
        step: 0.05,
      },
      {
        field: 'burstSpeed',
        label: 'Spark speed (1 = default)',
        min: 0.2,
        max: 3,
        step: 0.05,
      },
    ],
  },
  {
    title: 'Spark colour',
    kinds: ['travel', 'strike'],
    flag: { field: 'burstHasColour', label: 'Choose the spark colour' },
    colours: [{ field: 'burstColour', label: 'Spark colour' }],
    knobs: [],
  },
  {
    title: 'Finisher',
    kinds: ['travel', 'strike'],
    colours: [{ field: 'finishColour', label: 'Finisher colour' }],
    knobs: [
      {
        field: 'finishFlash',
        label: 'Bloom of light, size (0 = none)',
        min: 0,
        max: 8,
        step: 0.1,
      },
      {
        field: 'finishFlashMs',
        label: 'Bloom lasts (ms)',
        min: 60,
        max: 1000,
        step: 10,
        when: (tune) => tune.finishFlash > 0,
      },
      {
        field: 'finishRing',
        label: 'Shockwave ring, reach (px, 0 = none)',
        min: 0,
        max: 300,
      },
      {
        field: 'finishRingMs',
        label: 'Ring lasts (ms)',
        min: 100,
        max: 1200,
        step: 10,
        when: (tune) => tune.finishRing > 0,
      },
      {
        field: 'finishRingWidth',
        label: 'Ring line thickness (px)',
        min: 1,
        max: 20,
        step: 0.5,
        when: (tune) => tune.finishRing > 0,
      },
      {
        field: 'finishRingSquash',
        label: 'Ring height (1 = round)',
        min: 0.2,
        max: 1,
        step: 0.05,
        when: (tune) => tune.finishRing > 0,
      },
      {
        field: 'finishLinger',
        label: 'Lingering sparkles (0 = none)',
        min: 0,
        max: 80,
      },
      {
        field: 'finishLingerMs',
        label: 'Sparkles linger (ms)',
        min: 200,
        max: 2500,
        step: 20,
        when: (tune) => tune.finishLinger > 0,
      },
    ],
  },
];

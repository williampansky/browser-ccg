import type { SpellFxKind } from '../play-board/spell-fx';
import type { SpellFxTune } from '../play-board/spell-fx-tune';

type KeyOf<T> = {
  [K in keyof SpellFxTune]: SpellFxTune[K] extends T ? K : never;
}[keyof SpellFxTune];
type NumKey = KeyOf<number>;
type ChoiceKey = 'spotRingsMotion' | 'spotSparkMotion' | 'travelSprite';
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
    ],
  },
  {
    title: 'Picture',
    kinds: ['travel'],
    flag: {
      field: 'travelHasSprite',
      label: 'Fly a picture instead of the orb',
    },
    choices: [
      {
        field: 'travelSprite',
        label: 'Picture',
        options: [
          { value: 'dagger-green', label: 'Green dagger' },
          { value: 'dagger-purple', label: 'Purple dagger' },
          { value: 'dagger-cyan', label: 'Cyan curved dagger' },
          { value: 'dagger-pale', label: 'Pale curved dagger' },
          { value: 'dagger-orange', label: 'Orange dagger' },
          { value: 'dagger-bone', label: 'Bone dagger' },
        ],
      },
    ],
    knobs: [
      { field: 'travelSpriteSize', label: 'Size (px)', min: 16, max: 192 },
      {
        field: 'travelSpriteTurn',
        label: 'Turn (degrees, if it points off)',
        min: -180,
        max: 180,
      },
      {
        field: 'travelSpriteDepth',
        label: 'How far the point sinks in (px)',
        min: -20,
        max: 40,
      },
      {
        field: 'travelSpriteScatter',
        label: 'Lands off-centre by up to (px)',
        min: 0,
        max: 60,
      },
      {
        field: 'travelSpriteStick',
        label: 'Stays stuck for (ms)',
        min: 0,
        max: 2000,
        step: 10,
      },
      {
        field: 'travelSpriteFade',
        label: 'Then fades over (ms)',
        min: 0,
        max: 2000,
        step: 10,
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
      },
      {
        field: 'strikeDropout',
        label: 'Flicker (chance a frame dims)',
        min: 0,
        max: 1,
        step: 0.05,
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
        max: 3,
        step: 0.05,
      },
      { field: 'strikeSegments', label: 'Bends', min: 3, max: 30 },
      {
        field: 'strikeJitter',
        label: 'Kick of each bend (px)',
        min: 0,
        max: 100,
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
    title: 'Volley',
    kinds: ['travel', 'strike', 'spot'],
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
    kinds: ['travel', 'strike'],
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
    ],
  },
];

import type { SpellFxKind } from '../play-board/spell-fx';
import type { SpellFxTune } from '../play-board/spell-fx-tune';

type NumKey = {
  [K in keyof SpellFxTune]: SpellFxTune[K] extends number ? K : never;
}[keyof SpellFxTune];
type ColourKey = {
  [K in keyof SpellFxTune]: SpellFxTune[K] extends string ? K : never;
}[keyof SpellFxTune];

export interface SpellKnob {
  field: NumKey;
  label: string;
  min: number;
  max: number;
  step?: number;
}

/**
 * The spells lab's sliders, by section. Each lives in the URL as `s_<field>`.
 * `kind` is the effect the section belongs to (the lab opens that effect's
 * sections); the sparks section is shared by every effect.
 */
export const SPELL_GROUPS: {
  title: string;
  kind: SpellFxKind | 'all';
  knobs: SpellKnob[];
  colours?: { field: ColourKey; label: string }[];
}[] = [
  {
    title: 'Orb: flight',
    kind: 'orb',
    knobs: [
      {
        field: 'orbMs',
        label: 'Flight time (ms)',
        min: 80,
        max: 1200,
        step: 10,
      },
      {
        field: 'orbArc',
        label: 'Sideways bow (fraction of length)',
        min: 0,
        max: 0.4,
        step: 0.01,
      },
      {
        field: 'orbEase',
        label: 'Speed-up (1 = steady)',
        min: 0.5,
        max: 4,
        step: 0.1,
      },
    ],
  },
  {
    title: 'Orb: look',
    kind: 'orb',
    colours: [{ field: 'orbHaloColour', label: 'Glow colour' }],
    knobs: [
      {
        field: 'orbHaloScale',
        label: 'Glow size',
        min: 0.3,
        max: 3,
        step: 0.05,
      },
      {
        field: 'orbCoreScale',
        label: 'White core size',
        min: 0.1,
        max: 2,
        step: 0.05,
      },
      { field: 'orbPulse', label: 'Pulse', min: 0, max: 0.6, step: 0.01 },
    ],
  },
  {
    title: 'Orb: trail',
    kind: 'orb',
    colours: [{ field: 'orbTrailColour', label: 'Trail colour' }],
    knobs: [
      { field: 'orbTrailPerFrame', label: 'Puffs per frame', min: 0, max: 8 },
      {
        field: 'orbTrailLife',
        label: 'Puff life (ms)',
        min: 60,
        max: 900,
        step: 10,
      },
      {
        field: 'orbTrailScale',
        label: 'Puff size',
        min: 0.1,
        max: 1.5,
        step: 0.05,
      },
      { field: 'orbTrailSpread', label: 'Scatter (px)', min: 0, max: 24 },
      {
        field: 'orbTrailDrift',
        label: 'Drift speed',
        min: 0,
        max: 0.2,
        step: 0.005,
      },
    ],
  },
  {
    title: 'Lightning: timing',
    kind: 'lightning',
    knobs: [
      {
        field: 'lightningMs',
        label: 'Charge-up before the strike (ms)',
        min: 0,
        max: 800,
        step: 10,
      },
      {
        field: 'lightningLife',
        label: 'Bolt lasts (ms)',
        min: 80,
        max: 900,
        step: 10,
      },
      {
        field: 'lightningReroll',
        label: 'Re-forms every (ms)',
        min: 30,
        max: 400,
        step: 5,
      },
      {
        field: 'lightningDropout',
        label: 'Flicker (chance a frame dims)',
        min: 0,
        max: 1,
        step: 0.05,
      },
    ],
  },
  {
    title: 'Lightning: bolt',
    kind: 'lightning',
    colours: [{ field: 'lightningColour', label: 'Bolt colour' }],
    knobs: [
      {
        field: 'lightningWidth',
        label: 'Thickness',
        min: 0.3,
        max: 3,
        step: 0.05,
      },
      { field: 'lightningSegments', label: 'Bends', min: 3, max: 30 },
      {
        field: 'lightningJitter',
        label: 'Kick of each bend (px)',
        min: 0,
        max: 100,
      },
      {
        field: 'lightningSway',
        label: 'Start off to the side (px)',
        min: 0,
        max: 400,
      },
      { field: 'lightningBranches', label: 'Forks', min: 0, max: 8 },
      {
        field: 'lightningBranchReach',
        label: 'Fork reach (px)',
        min: 20,
        max: 400,
      },
    ],
  },
  {
    title: 'Lightning: glow and flash',
    kind: 'lightning',
    knobs: [
      {
        field: 'lightningGlowScale',
        label: 'Charge-up glow size',
        min: 0,
        max: 8,
        step: 0.1,
      },
      {
        field: 'lightningScreenFlash',
        label: 'Screen flash strength',
        min: 0,
        max: 1,
        step: 0.01,
      },
    ],
  },
  {
    title: 'Impact sparks (every effect)',
    kind: 'all',
    knobs: [
      { field: 'orbBurstCount', label: 'Sparks', min: 0, max: 60 },
      {
        field: 'orbBurstLife',
        label: 'Spark life (ms)',
        min: 80,
        max: 1200,
        step: 10,
      },
      {
        field: 'orbBurstScale',
        label: 'Spark size',
        min: 0.1,
        max: 2,
        step: 0.05,
      },
    ],
  },
];

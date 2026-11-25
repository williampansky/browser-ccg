/**
 * The numbers behind the spell effects in `pixi-fx.ts`. `SPELL_FX_DEFAULTS` is
 * the saved look; the spells lab (`/spells-lab`) edits it live through
 * `s_<field>` URL params (`parseSpellTune`). Every effect is handed the tune
 * it should play, so two spells can look different. Colours are 6-digit hex strings without the `#`.
 */
export interface SpellFxTune {
  /** Orb: milliseconds from cast to hit */
  orbMs: number;
  /** Orb: size of the outer glow and of the white core (1 = a 32 px dot) */
  orbHaloScale: number;
  orbCoreScale: number;
  /** Orb: how much the size pulses (0 = steady) */
  orbPulse: number;
  /** Orb: how far the flight bows sideways, as a fraction of its length */
  orbArc: number;
  /** Orb: speed-up curve (1 = steady, higher = slow start, fast finish) */
  orbEase: number;
  /** Trail: puffs per frame, life (ms), size, scatter (px), drift speed */
  orbTrailPerFrame: number;
  orbTrailLife: number;
  orbTrailScale: number;
  orbTrailSpread: number;
  orbTrailDrift: number;
  /** Impact sparks (every effect): how many, life (ms), size */
  orbBurstCount: number;
  orbBurstLife: number;
  orbBurstScale: number;
  orbHaloColour: string;
  orbTrailColour: string;
  /** Lightning: milliseconds of charge-up before the strike */
  lightningMs: number;
  /** Lightning: bends in the main bolt, and how far each kicks sideways (px) */
  lightningSegments: number;
  lightningJitter: number;
  /** Lightning: how far the top of the bolt may sit off the target's column */
  lightningSway: number;
  /** Lightning: how long the bolt lasts after the strike (ms) */
  lightningLife: number;
  /** Lightning: how often the bolt re-forms (ms) and how often it dims */
  lightningReroll: number;
  lightningDropout: number;
  /** Lightning: size of the charge-up glow */
  lightningGlowScale: number;
  /** Lightning: side forks, and how far they reach (px) */
  lightningBranches: number;
  lightningBranchReach: number;
  /** Lightning: line thickness, 1 = as drawn */
  lightningWidth: number;
  /** Lightning: strength of the white screen flash (0 = none) */
  lightningScreenFlash: number;
  lightningColour: string;
}

export const SPELL_FX_DEFAULTS: SpellFxTune = {
  orbMs: 280,
  orbHaloScale: 1.25,
  orbCoreScale: 0.5,
  orbPulse: 0.18,
  orbArc: 0.07,
  orbEase: 1.8,
  orbTrailPerFrame: 3,
  orbTrailLife: 260,
  orbTrailScale: 0.4,
  orbTrailSpread: 3,
  orbTrailDrift: 0.03,
  orbBurstCount: 18,
  orbBurstLife: 420,
  orbBurstScale: 0.55,
  orbHaloColour: 'ffb347',
  orbTrailColour: 'ff8a2a',
  lightningMs: 160,
  lightningSegments: 14,
  lightningJitter: 34,
  lightningSway: 120,
  lightningLife: 300,
  lightningReroll: 90,
  lightningDropout: 0.3,
  lightningGlowScale: 3,
  lightningBranches: 3,
  lightningBranchReach: 150,
  lightningWidth: 1,
  lightningScreenFlash: 0.28,
  lightningColour: '8fb8ff',
};

/**
 * Saved per-spell looks, keyed by spell (a card id, or `<CLASS>:<skill
 * number>` for a hero skill): only the numbers that differ from the defaults.
 * Empty until the spells lab can bake into it; a spell without an entry
 * plays the defaults.
 */
export const SPELL_FX_VARIANTS: Record<string, Partial<SpellFxTune>> = {};

/** The look a spell plays: the defaults with its saved variant on top. */
export const tuneForSpell = (key: string | null): SpellFxTune => ({
  ...SPELL_FX_DEFAULTS,
  ...(key ? SPELL_FX_VARIANTS[key] : undefined),
});

/**
 * The tune from a URL query string: `s_<field>` params over `base` (the
 * defaults unless the lab passes a spell's saved look). Numbers and 6-digit
 * hex colours; anything else is ignored.
 */
export const parseSpellTune = (
  search: string,
  base: SpellFxTune = SPELL_FX_DEFAULTS,
): SpellFxTune => {
  const params = new URLSearchParams(search);
  const tune: Record<string, number | string> = { ...base };
  (Object.keys(SPELL_FX_DEFAULTS) as (keyof SpellFxTune)[]).forEach((field) => {
    const raw = params.get(`s_${field}`);
    if (raw === null) return;
    const isColour = typeof SPELL_FX_DEFAULTS[field] === 'string';
    if (isColour) {
      if (/^[0-9a-f]{6}$/i.test(raw)) tune[field] = raw.toLowerCase();
    } else if (raw !== '' && !Number.isNaN(+raw)) {
      tune[field] = +raw;
    }
  });
  return tune as unknown as SpellFxTune;
};

const HEX_RADIX = 16;

/** A hex colour string as the number Pixi wants. */
export const colourNumber = (hex: string): number => parseInt(hex, HEX_RADIX);

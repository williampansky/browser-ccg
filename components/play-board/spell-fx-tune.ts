/**
 * The numbers and options behind the spell effects in `pixi-fx.ts`, grouped by
 * the base they belong to (`travel`, `strike`, `spot`; `burst` is shared).
 * `SPELL_FX_DEFAULTS` is the saved look; the spells lab (`/spells-lab`) edits it
 * live through `s_<field>` URL params (`parseSpellTune`). Every effect is handed
 * the tune it should play, so two spells can look different. Colours are
 * 6-digit hex strings without the `#`; options are `has...` flags, and the
 * lab only shows the numbers an option switches on.
 */
export interface SpellFxTune {
  /** Travel: milliseconds from cast to hit */
  travelMs: number;
  /** Travel: size of the outer glow and of the white core (1 = a 32 px dot) */
  travelHaloScale: number;
  travelCoreScale: number;
  /** Travel: how much the size pulses (0 = steady) */
  travelPulse: number;
  /** Travel: how far the flight bows sideways, as a fraction of its length */
  travelArc: number;
  /** Travel: speed-up curve (1 = steady, higher = slow start, fast finish) */
  travelEase: number;
  travelColour: string;
  /** Travel option: leave a particle trail behind the orb */
  travelHasTrail: boolean;
  /** Trail: puffs per frame, life (ms), size, scatter (px), drift speed */
  travelTrailPerFrame: number;
  travelTrailLife: number;
  travelTrailScale: number;
  travelTrailSpread: number;
  travelTrailDrift: number;
  travelTrailColour: string;
  /** Strike: milliseconds of charge-up before the hit */
  strikeMs: number;
  /** Strike: bends in the main bolt, and how far each kicks sideways (px) */
  strikeSegments: number;
  strikeJitter: number;
  /** Strike: how far the top of the bolt may sit off the target's column */
  strikeSway: number;
  /** Strike: how long the bolt lasts after the hit (ms) */
  strikeLife: number;
  /** Strike: how often the bolt re-forms (ms) and how often it dims */
  strikeReroll: number;
  strikeDropout: number;
  /** Strike: size of the charge-up glow */
  strikeGlowScale: number;
  /** Strike: line thickness, 1 = as drawn */
  strikeWidth: number;
  strikeColour: string;
  /** Strike option: side forks off the bolt, and how far they reach (px) */
  strikeHasForks: boolean;
  strikeBranches: number;
  strikeBranchReach: number;
  /** Strike option: a white flash across the screen, and its strength */
  strikeHasFlash: boolean;
  strikeScreenFlash: number;
  /** Spot: how long each ring takes to open (ms), how far it opens (px) */
  spotLife: number;
  spotRadius: number;
  /** Spot: rings, the delay between them (ms), line thickness (px) */
  spotRings: number;
  spotRingGap: number;
  spotWidth: number;
  /** Spot: corners of each ring (6 = a hexagon, 48 or so = a circle) */
  spotSides: number;
  /** Spot: the first ring, and the later rings */
  spotColour: string;
  spotAccentColour: string;
  /** Spot option: a soft glow behind the rings, and its size */
  spotHasGlow: boolean;
  spotGlowScale: number;
  /** Spot option: sparks flying out, and how many */
  spotHasSparks: boolean;
  spotSparkCount: number;
  /** Impact sparks on a hit (travel and strike): how many, life (ms), size */
  burstCount: number;
  burstLife: number;
  burstScale: number;
}

export const SPELL_FX_DEFAULTS: SpellFxTune = {
  travelMs: 280,
  travelHaloScale: 1.25,
  travelCoreScale: 0.5,
  travelPulse: 0.18,
  travelArc: 0.07,
  travelEase: 1.8,
  travelColour: 'ffb347',
  travelHasTrail: true,
  travelTrailPerFrame: 3,
  travelTrailLife: 260,
  travelTrailScale: 0.4,
  travelTrailSpread: 3,
  travelTrailDrift: 0.03,
  travelTrailColour: 'ff8a2a',
  strikeMs: 160,
  strikeSegments: 14,
  strikeJitter: 34,
  strikeSway: 120,
  strikeLife: 300,
  strikeReroll: 90,
  strikeDropout: 0.3,
  strikeGlowScale: 3,
  strikeWidth: 1,
  strikeColour: '8fb8ff',
  strikeHasForks: true,
  strikeBranches: 3,
  strikeBranchReach: 150,
  strikeHasFlash: true,
  strikeScreenFlash: 0.28,
  spotLife: 520,
  spotRadius: 120,
  spotRings: 2,
  spotRingGap: 110,
  spotWidth: 6,
  spotSides: 6,
  spotColour: 'cfe3ff',
  spotAccentColour: 'ffd23f',
  spotHasGlow: true,
  spotGlowScale: 3,
  spotHasSparks: true,
  spotSparkCount: 14,
  burstCount: 18,
  burstLife: 420,
  burstScale: 0.55,
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
 * defaults unless the lab passes a spell's saved look). Numbers, `1` / `0`
 * flags and 6-digit hex colours; anything else is ignored.
 */
export const parseSpellTune = (
  search: string,
  base: SpellFxTune = SPELL_FX_DEFAULTS,
): SpellFxTune => {
  const params = new URLSearchParams(search);
  const tune: Record<string, number | string | boolean> = { ...base };
  (Object.keys(SPELL_FX_DEFAULTS) as (keyof SpellFxTune)[]).forEach((field) => {
    const raw = params.get(`s_${field}`);
    if (raw === null) return;
    const kind = typeof SPELL_FX_DEFAULTS[field];
    if (kind === 'boolean') {
      if (raw === '0' || raw === '1') tune[field] = raw === '1';
    } else if (kind === 'string') {
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

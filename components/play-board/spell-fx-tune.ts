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
  /** Spot: how the rings move (open outward, close inward, or pulse in place) */
  spotRingsMotion: 'out' | 'in' | 'pulse';
  /** Spot: the tint inside each ring (0 = none) */
  spotFillAlpha: number;
  /** Spot: how soft the first ring is (blur in px, 0 = crisp lines) */
  spotRingBlur: number;
  /** Spot: blur added to each later ring (can be negative; never below 0) */
  spotRingBlurStep: number;
  /** Spot: the first ring, and the later rings */
  spotColour: string;
  spotAccentColour: string;
  /** Spot option: a soft glow behind the rings, and its size */
  spotHasGlow: boolean;
  spotGlowScale: number;
  /** Spot option: sparks flying out, and how many */
  spotHasSparks: boolean;
  spotSparkCount: number;
  /** Spot sparks: where they go (rising ones start staggered) */
  spotSparkMotion: 'outward' | 'rising' | 'inward';
  /** Spot sparks: speed (px per ms), life (ms), size, start scatter (px) */
  spotSparkSpeed: number;
  spotSparkLife: number;
  spotSparkScale: number;
  spotSparkSpread: number;
  /** Volley (every base): how many times the effect plays per target hit */
  volleyCount: number;
  /** Volley: ms between one animation and the next, across targets too */
  volleyDelay: number;
  /** Impact sparks on a hit (travel and strike): how many, life (ms), size */
  burstCount: number;
  burstLife: number;
  burstScale: number;
}

/**
 * The fields that pick one of a few words (not a colour), with the words they
 * take. A string field that is not listed here is a hex colour.
 */
export const SPELL_FX_CHOICES: Partial<
  Record<keyof SpellFxTune, readonly string[]>
> = {
  spotRingsMotion: ['out', 'in', 'pulse'],
  spotSparkMotion: ['outward', 'rising', 'inward'],
};

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
  spotRingsMotion: 'out',
  spotFillAlpha: 0.1,
  spotRingBlur: 0,
  spotRingBlurStep: 0,
  spotColour: 'cfe3ff',
  spotAccentColour: 'ffd23f',
  spotHasGlow: true,
  spotGlowScale: 3,
  spotHasSparks: true,
  spotSparkCount: 14,
  spotSparkMotion: 'outward',
  spotSparkSpeed: 0.22,
  spotSparkLife: 480,
  spotSparkScale: 0.5,
  spotSparkSpread: 0,
  volleyCount: 1,
  volleyDelay: 120,
  burstCount: 18,
  burstLife: 420,
  burstScale: 0.55,
};

/**
 * Saved per-spell looks, keyed by spell (a card id, or `<CLASS>:<skill
 * number>` for a hero skill): only the numbers that differ from the defaults.
 * `npm run spell -- "<spells-lab url>"` writes into it; a spell without an
 * entry plays the defaults.
 */
export const SPELL_FX_VARIANTS: Record<string, Partial<SpellFxTune>> = {
  'ASSASSIN:1': {
    spotLife: 550,
    spotRadius: 110,
    spotRings: 3,
    spotRingGap: 165,
    spotSides: 10,
    spotRingsMotion: 'in',
    spotFillAlpha: 0.23,
    spotRingBlurStep: -7,
    spotAccentColour: 'bdb189',
    spotGlowScale: 1,
    spotHasSparks: false,
    spotSparkMotion: 'inward',
    spotSparkSpread: 200,
  },
  'CLERIC:1': {
    spotLife: 1200,
    spotRadius: 70,
    spotRings: 1,
    spotRingGap: 400,
    spotWidth: 2,
    spotSides: 48,
    spotRingsMotion: 'pulse',
    spotFillAlpha: 0.2,
    spotColour: 'e2f109',
    spotAccentColour: 'ffe9a8',
    spotGlowScale: 6,
    spotSparkCount: 46,
    spotSparkMotion: 'rising',
    spotSparkSpeed: 0.1,
    spotSparkLife: 1500,
    spotSparkScale: 0.4,
    spotSparkSpread: 60,
  },
  CORE_063: {
    travelMs: 690,
    travelCoreScale: 1,
    travelColour: 'ff1ff8',
    travelTrailPerFrame: 8,
    travelTrailLife: 560,
    travelTrailSpread: 1,
    travelTrailDrift: 0.04,
    travelTrailColour: 'df87f8',
    volleyDelay: 385,
    burstCount: 37,
    burstLife: 570,
    burstScale: 0.85,
  },
  CORE_093: {
    travelMs: 300,
    travelHaloScale: 0.5,
    travelCoreScale: 0.8,
    travelPulse: 0.07,
    travelArc: 0.05,
    travelEase: 1.4,
    travelColour: 'ff7575',
    travelTrailPerFrame: 6,
    travelTrailLife: 560,
    travelTrailScale: 0.5,
    travelTrailSpread: 8,
    travelTrailDrift: 0.1,
    travelTrailColour: '402f17',
    burstCount: 20,
    burstLife: 700,
    burstScale: 0.2,
  },
  CORE_115: {
    spotLife: 550,
    spotRadius: 110,
    spotRings: 3,
    spotRingGap: 165,
    spotSides: 48,
    spotRingsMotion: 'in',
    spotFillAlpha: 0.35,
    spotRingBlur: 4,
    spotRingBlurStep: 5,
    spotAccentColour: 'bdb189',
    spotGlowScale: 1,
    spotHasSparks: false,
    spotSparkMotion: 'inward',
    spotSparkSpread: 200,
  },
  'CRUSADER:1': {
    spotLife: 700,
    spotRings: 3,
    spotRingGap: 220,
    spotRingBlur: 1,
    spotRingBlurStep: 10,
    spotAccentColour: 'fffa70',
    spotGlowScale: 6,
    spotSparkCount: 20,
    spotSparkSpeed: 0.2,
    spotSparkLife: 1000,
    spotSparkScale: 0.6,
    spotSparkSpread: 0,
  },
  'FIGHTER:1': {
    spotColour: '748ae2',
    spotAccentColour: '139fcd',
    spotGlowScale: 8,
    spotSparkCount: 20,
  },
  'MYSTIC:1': {
    spotLife: 890,
    spotColour: '3dff5d',
    spotAccentColour: 'b8ffc3',
    spotSparkCount: 20,
    spotSparkSpeed: 0.27,
    spotSparkLife: 790,
    spotSparkScale: 0.15,
    spotSparkSpread: 130,
  },
  'NECROMANCER:1': {
    spotLife: 1500,
    spotRadius: 65,
    spotRings: 1,
    spotWidth: 3,
    spotSides: 48,
    spotRingsMotion: 'in',
    spotFillAlpha: 0.6,
    spotRingBlur: 10,
    spotColour: 'f5d1ff',
    spotAccentColour: 'fc3dff',
    spotGlowScale: 6,
    spotSparkCount: 25,
    spotSparkMotion: 'inward',
    spotSparkSpeed: 0.15,
    spotSparkLife: 900,
    spotSparkScale: 0.25,
    spotSparkSpread: 70,
  },
  PRIME_201: {
    strikeMs: 500,
    strikeSegments: 18,
    strikeJitter: 45,
    strikeSway: 292,
    strikeLife: 150,
    strikeReroll: 175,
    strikeDropout: 0.6,
    strikeGlowScale: 2.9,
    strikeWidth: 0.55,
    strikeColour: '24bdff',
    strikeBranches: 1,
    strikeBranchReach: 20,
    strikeHasFlash: false,
    burstCount: 32,
    burstLife: 590,
    burstScale: 0.15,
  },
  'RANGER:1': {
    travelMs: 300,
    travelHaloScale: 0.5,
    travelCoreScale: 0.8,
    travelPulse: 0,
    travelArc: 0,
    travelEase: 4,
    travelColour: 'ffffff',
    travelTrailPerFrame: 6,
    travelTrailLife: 560,
    travelTrailScale: 0.5,
    travelTrailSpread: 8,
    travelTrailDrift: 0.1,
    travelTrailColour: '302b27',
    burstCount: 40,
    burstLife: 900,
    burstScale: 0.2,
  },
  summon: {
    spotLife: 450,
    spotRadius: 55,
    spotRings: 1,
    spotWidth: 2,
    spotSides: 48,
    spotRingsMotion: 'in',
    spotFillAlpha: 0.06,
    spotRingBlur: 5,
    spotColour: 'f3e9c6',
    spotAccentColour: 'cfe3ff',
    spotGlowScale: 5.1,
    spotSparkCount: 10,
    spotSparkMotion: 'inward',
    spotSparkSpeed: 0.1,
    spotSparkLife: 420,
    spotSparkScale: 0.35,
    spotSparkSpread: 50,
  },
  'WARDEN:1': {
    spotLife: 1100,
    spotRadius: 70,
    spotRingGap: 300,
    spotWidth: 4,
    spotSides: 8,
    spotRingsMotion: 'pulse',
    spotFillAlpha: 0.12,
    spotRingBlur: 3,
    spotColour: '3f8f3a',
    spotAccentColour: 'ffb347',
    spotGlowScale: 4,
    spotSparkCount: 28,
    spotSparkMotion: 'rising',
    spotSparkSpeed: 0.09,
    spotSparkLife: 900,
    spotSparkScale: 0.3,
    spotSparkSpread: 60,
  },
};

/**
 * Spells whose look starts from another entry's: a skill that summons begins
 * as the `summon` look and its own saved numbers go on top, so it can be
 * tweaked from there. The base effect (`travel`, `strike`, `spot`) is
 * inherited the same way.
 */
export const SPELL_FX_PARENTS: Record<string, string> = {
  'CRUSADER:1': 'summon',
  'MYSTIC:1': 'summon',
};

/** A key, then its parent, then that one's parent (the key last). */
export const fxChain = (key: string | null): string[] => {
  const chain: string[] = [];
  let next = key;
  while (next && !chain.includes(next)) {
    chain.unshift(next);
    next = SPELL_FX_PARENTS[next] ?? null;
  }
  return chain;
};

/**
 * The look a spell plays: the defaults, then each saved variant down its
 * chain of parents.
 */
export const tuneForSpell = (key: string | null): SpellFxTune =>
  Object.assign(
    {},
    SPELL_FX_DEFAULTS,
    ...fxChain(key).map((link) => SPELL_FX_VARIANTS[link]),
  );

/**
 * The tune from a URL query string: `s_<field>` params over `base` (the
 * defaults unless the lab passes a spell's saved look). Numbers, `1` / `0`
 * flags, listed words and 6-digit hex colours; anything else is ignored.
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
      const words = SPELL_FX_CHOICES[field];
      if (words) {
        if (words.includes(raw)) tune[field] = raw;
      } else if (/^[0-9a-f]{6}$/i.test(raw)) {
        tune[field] = raw.toLowerCase();
      }
    } else if (raw !== '' && !Number.isNaN(+raw)) {
      tune[field] = +raw;
    }
  });
  return tune as unknown as SpellFxTune;
};

const HEX_RADIX = 16;

/** A hex colour string as the number Pixi wants. */
export const colourNumber = (hex: string): number => parseInt(hex, HEX_RADIX);

import { SPELL_FX_SPRITES } from './spell-fx-sprites';

/**
 * The numbers and options behind the spell effects in `pixi-fx/`, grouped by
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
  /** Travel: stretch the glowing head along its flight (1 = round) */
  travelStretch: number;
  /** Travel option: fly a picture (a dagger) instead of the orb */
  travelHasSprite: boolean;
  /** Picture (every base): which one (see `SPELL_FX_SPRITES`) */
  sprite: string;
  /** Picture: width (px), an extra turn (degrees), and spin (degrees per
   * second; 0 = point first, anything else tumbles it like a thrown axe) */
  spriteSize: number;
  spriteTurn: number;
  spriteSpin: number;
  /** Picture: how far the point sinks into the target past its centre (px) */
  spriteDepth: number;
  /** Picture: how far from the centre each lands, at random (px) */
  spriteScatter: number;
  /** Picture: ms it stays stuck in the target, then ms it takes to fade */
  spriteStick: number;
  spriteFade: number;
  /** Travel option: wispy streamers that flail off behind the head */
  travelHasStreamers: boolean;
  /** Streamers: how many, how long (px), how far they wave sideways (px) */
  travelStreamerCount: number;
  travelStreamerLength: number;
  travelStreamerWave: number;
  /** Streamers: flail speed (1 = slow sway, higher = whipping) */
  travelStreamerFlail: number;
  /** Streamers: how far they fan out at their tips (px), width at the base */
  travelStreamerSpread: number;
  travelStreamerWidth: number;
  /** Streamers: opacity (0 to 1), ms to grow out at the start, ms they keep
   * flailing after the hit */
  travelStreamerAlpha: number;
  travelStreamerGrow: number;
  travelStreamerLinger: number;
  travelStreamerColour: string;
  /** Travel option: leave a particle trail behind the orb */
  travelHasTrail: boolean;
  /** Trail: puffs per frame, life (ms), size, scatter (px), drift speed */
  travelTrailPerFrame: number;
  travelTrailLife: number;
  travelTrailScale: number;
  travelTrailSpread: number;
  travelTrailDrift: number;
  travelTrailColour: string;
  /** Strike: the look (a jagged bolt or a straight beam) */
  strikeStyle: 'lightning' | 'beam';
  /** Strike: lean from straight down, in degrees (0 = vertical; + comes from
   * the upper left, - from the upper right) */
  strikeAngle: number;
  /** Strike beam: ms it takes to reach the target (0 = at once) */
  strikeBeamGrow: number;
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
  /** Strike option: a picture falls onto the target instead of a bolt */
  strikeHasSprite: boolean;
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
  /**
   * Spot: how the rings move (open outward, close inward, pulse in place, or
   * close while sliding down)
   */
  spotRingsMotion: 'out' | 'in' | 'pulse' | 'descend';
  /** Spot, descending rings: how far above and below the spot one starts and ends (px) */
  spotDescendStart: number;
  spotDescendEnd: number;
  /** Spot: squashes every ring's height (1 = round, 0.3 = a flat halo) */
  spotRingSquash: number;
  /** Spot: where it plays, on the spell's target or on every minion of a side */
  spotAnchor: 'target' | 'enemy-minions' | 'my-minions' | 'all-minions';
  /** Spot: the delay from one minion to the next when it plays on several (ms) */
  spotStagger: number;
  /** Spot: the tint inside each ring (0 = none) */
  spotFillAlpha: number;
  /** Spot: how soft the first ring is (blur in px, 0 = crisp lines) */
  spotRingBlur: number;
  /** Spot: blur added to each later ring (can be negative; never below 0) */
  spotRingBlurStep: number;
  /** Spot: the first ring, and the later rings */
  spotColour: string;
  spotAccentColour: string;
  /** Spot option: a picture pops up at the spot (and rises) over the rings */
  spotHasSprite: boolean;
  spotSpriteRise: number;
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
  /** Area: the look (swirl or sweep), and which side of the board it covers */
  areaStyle: 'swirl' | 'sweep' | 'shockwave' | 'rain';
  areaRegion: 'enemy' | 'mine' | 'both';
  /** Area: how long it plays (ms), and when its damage lands (ms in) */
  areaMs: number;
  areaImpactMs: number;
  /** Area: padding around the minions it covers (px) */
  areaPad: number;
  /** Area: the body colour and the bright edge colour */
  areaColour: string;
  areaAccentColour: string;
  /** Area: softness (blur in px, 0 = crisp) */
  areaBlur: number;
  /** Area: embers per second riding the effect, and the table shake (0 = none) */
  areaEmbers: number;
  areaShake: number;
  /** Area option: a flash of the edge colour across the screen */
  areaHasFlash: boolean;
  areaFlash: number;
  /** Swirl: arms, turns of each arm, spin (turns per second), band width (px) */
  areaArms: number;
  areaTurns: number;
  areaSpin: number;
  areaWidth: number;
  /** Shockwave: rings, ms between them */
  areaRings: number;
  areaRingGap: number;
  /** Rain: which way it moves, how many drops per second, their speed (px
   * per ms) and size */
  areaFall: 'down' | 'up';
  areaDrops: number;
  areaDropSpeed: number;
  areaDropScale: number;
  /** Sweep: which way the wave runs, and how wide it is (px) */
  areaDirection: 'right' | 'left' | 'out';
  areaWaveWidth: number;
  /** Volley (every base): how many times the effect plays per target hit */
  volleyCount: number;
  /** Volley: ms between one animation and the next, across targets too */
  volleyDelay: number;
  /** Impact sparks on a hit (travel and strike): how many, life (ms), size */
  burstCount: number;
  burstLife: number;
  burstScale: number;
  /** Impact sparks: how fast they fly (1 = the default speed) */
  burstSpeed: number;
  /** Finisher on a hit (travel and strike): a bloom of light (size, 0 = none) and its life (ms) */
  finishFlash: number;
  finishFlashMs: number;
  /** Finisher: an expanding ring (reach px, 0 = none), its life (ms), line width (px) and height (1 = round) */
  finishRing: number;
  finishRingMs: number;
  finishRingWidth: number;
  finishRingSquash: number;
  /** Finisher: sparkles that linger and drift up (how many, 0 = none) and for how long (ms) */
  finishLinger: number;
  finishLingerMs: number;
  /** Finisher: the colour of the bloom, ring and sparkles (hex, no #) */
  finishColour: string;
}

/**
 * The fields that pick one of a few words (not a colour), with the words they
 * take. A string field that is not listed here is a hex colour.
 */
export const SPELL_FX_CHOICES: Partial<
  Record<keyof SpellFxTune, readonly string[]>
> = {
  sprite: SPELL_FX_SPRITES.map((art) => art.id),
  strikeStyle: ['lightning', 'beam'],
  areaStyle: ['swirl', 'sweep', 'shockwave', 'rain'],
  areaFall: ['down', 'up'],
  areaRegion: ['enemy', 'mine', 'both'],
  areaDirection: ['right', 'left', 'out'],
  spotRingsMotion: ['out', 'in', 'pulse', 'descend'],
  spotAnchor: ['target', 'enemy-minions', 'my-minions', 'all-minions'],
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
  travelStretch: 1,
  travelHasSprite: false,
  sprite: 'dagger-green',
  spriteSize: 64,
  spriteTurn: 0,
  spriteSpin: 0,
  spriteDepth: 8,
  spriteScatter: 12,
  spriteStick: 500,
  spriteFade: 400,
  travelHasStreamers: false,
  travelStreamerCount: 6,
  travelStreamerLength: 160,
  travelStreamerWave: 40,
  travelStreamerFlail: 1,
  travelStreamerSpread: 50,
  travelStreamerWidth: 5,
  travelStreamerAlpha: 0.55,
  travelStreamerGrow: 250,
  travelStreamerLinger: 300,
  travelStreamerColour: 'ff4fb0',
  travelHasTrail: true,
  travelTrailPerFrame: 3,
  travelTrailLife: 260,
  travelTrailScale: 0.4,
  travelTrailSpread: 3,
  travelTrailDrift: 0.03,
  travelTrailColour: 'ff8a2a',
  strikeStyle: 'lightning',
  strikeAngle: 0,
  strikeBeamGrow: 120,
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
  strikeHasSprite: false,
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
  spotDescendStart: 80,
  spotDescendEnd: 80,
  spotRingSquash: 1,
  spotAnchor: 'target',
  spotStagger: 60,
  spotFillAlpha: 0.1,
  spotRingBlur: 0,
  spotRingBlurStep: 0,
  spotColour: 'cfe3ff',
  spotAccentColour: 'ffd23f',
  spotHasSprite: false,
  spotSpriteRise: 24,
  spotHasGlow: true,
  spotGlowScale: 3,
  spotHasSparks: true,
  spotSparkCount: 14,
  spotSparkMotion: 'outward',
  spotSparkSpeed: 0.22,
  spotSparkLife: 480,
  spotSparkScale: 0.5,
  spotSparkSpread: 0,
  areaStyle: 'swirl',
  areaRegion: 'enemy',
  areaMs: 1000,
  areaImpactMs: 380,
  areaPad: 90,
  areaColour: 'ff6a14',
  areaAccentColour: 'ffe14d',
  areaBlur: 6,
  areaEmbers: 60,
  areaShake: 4,
  areaHasFlash: true,
  areaFlash: 0.2,
  areaArms: 3,
  areaTurns: 1.5,
  areaSpin: 0.9,
  areaWidth: 34,
  areaRings: 2,
  areaRingGap: 160,
  areaFall: 'down',
  areaDrops: 240,
  areaDropSpeed: 0.6,
  areaDropScale: 0.35,
  areaDirection: 'right',
  areaWaveWidth: 110,
  volleyCount: 1,
  volleyDelay: 120,
  burstCount: 18,
  burstLife: 420,
  burstScale: 0.55,
  burstSpeed: 1,
  finishFlash: 0,
  finishFlashMs: 260,
  finishRing: 0,
  finishRingMs: 420,
  finishRingWidth: 4,
  finishRingSquash: 0.8,
  finishLinger: 0,
  finishLingerMs: 900,
  finishColour: 'ffd27a',
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
  CORE_001: {
    travelMs: 300,
    travelArc: 0.03,
    travelEase: 3.1,
    travelColour: '55f21c',
    travelStretch: 2,
    travelTrailPerFrame: 8,
    travelTrailLife: 60,
    travelTrailScale: 0.25,
    travelTrailSpread: 0,
    travelTrailDrift: 0,
    travelTrailColour: '2c9325',
  },
  CORE_006: {
    travelMs: 1200,
    travelHaloScale: 0.6,
    travelArc: 0.4,
    travelEase: 4,
    travelColour: '47ffc8',
    travelTrailColour: '29ff4c',
  },
  CORE_058: {
    travelMs: 170,
    travelHaloScale: 0.95,
    travelCoreScale: 0.8,
    travelPulse: 0.07,
    travelArc: 0,
    travelEase: 2.5,
    travelColour: 'ffcd75',
    travelTrailPerFrame: 6,
    travelTrailLife: 560,
    travelTrailScale: 0.25,
    travelTrailSpread: 2,
    travelTrailDrift: 0.04,
    travelTrailColour: '726c65',
    burstCount: 60,
    burstLife: 550,
    burstScale: 0.2,
  },
  CORE_060: {
    travelMs: 250,
    travelHaloScale: 0.9,
    travelCoreScale: 0.75,
    travelPulse: 0.1,
    travelArc: 0,
    travelEase: 1.1,
    travelColour: 'ff6347',
    travelStretch: 4,
    travelTrailColour: 'ffdb29',
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
  CORE_068: {
    areaStyle: 'shockwave',
    areaPad: 55,
    areaColour: 'd643c2',
    areaAccentColour: 'e680f4',
    areaEmbers: 150,
    areaShake: 0,
    areaHasFlash: false,
    areaFlash: 0.1,
    areaWidth: 20,
    areaRings: 1,
    areaRingGap: 600,
  },
  CORE_069: {
    travelMs: 710,
    travelHaloScale: 0.9,
    travelCoreScale: 2,
    travelPulse: 0.6,
    travelArc: 0,
    travelEase: 4,
    travelColour: 'ed35a1',
    travelHasStreamers: true,
    travelStreamerCount: 12,
    travelStreamerLength: 271,
    travelStreamerWave: 12,
    travelStreamerFlail: 0.8,
    travelStreamerWidth: 11,
    travelStreamerLinger: 600,
    travelTrailPerFrame: 8,
    travelTrailLife: 900,
    travelTrailScale: 0.55,
    travelTrailDrift: 0.025,
    travelTrailColour: 'dd88d6',
    burstCount: 40,
    burstLife: 680,
    burstScale: 0.5,
  },
  CORE_083: {
    travelMs: 1200,
    travelHaloScale: 2.2,
    travelCoreScale: 1.2,
    travelPulse: 0.09,
    travelEase: 4,
    travelColour: 'ffccfd',
    travelStretch: 1.3,
    travelTrailPerFrame: 8,
    travelTrailLife: 900,
    travelTrailColour: 'f39af9',
  },
  CORE_092: {
    sprite: 'mind-circle',
    spriteSize: 45,
    spotLife: 970,
    spotRingGap: 400,
    spotWidth: 3,
    spotSides: 48,
    spotRingsMotion: 'in',
    spotFillAlpha: 0.06,
    spotRingBlurStep: 10,
    spotColour: 'bf73f2',
    spotAccentColour: 'ee2fcb',
    spotHasSprite: true,
    spotSpriteRise: 45,
    spotGlowScale: 6,
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
  CORE_098: {
    areaImpactMs: 1060,
    areaPad: 70,
    areaTurns: 0.9,
    areaSpin: 0.6,
    burstCount: 35,
  },
  CORE_111: {
    sprite: 'skull-beast',
    spriteSize: 65,
    spotLife: 770,
    spotRadius: 73,
    spotSides: 18,
    spotRingBlur: 8,
    spotColour: '43e545',
    spotAccentColour: '317f15',
    spotHasSprite: true,
    spotSpriteRise: 10,
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
  CORE_120: {
    travelEase: 0.5,
    spotLife: 400,
    spotRadius: 80,
    spotRings: 3,
    spotRingGap: 205,
    spotWidth: 20,
    spotSides: 13,
    spotRingsMotion: 'pulse',
    spotFillAlpha: 0.15,
    spotRingBlur: 10,
    spotRingBlurStep: -6,
    spotColour: 'f5d1ff',
    spotAccentColour: 'cb3dff',
  },
  CORE_125: {
    travelMs: 170,
    travelArc: 0.06,
    travelHasSprite: true,
    sprite: 'dagger-bone',
    spriteSize: 45,
    spriteTurn: -15,
    spriteDepth: 4,
    travelTrailPerFrame: 1,
    travelTrailLife: 490,
    travelTrailScale: 0.15,
    travelTrailSpread: 8,
    travelTrailDrift: 0.12,
    travelTrailColour: 'bfbfbf',
    volleyDelay: 100,
    burstCount: 6,
    burstScale: 0.4,
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
  PRIME_116: {
    areaStyle: 'rain',
    areaRegion: 'mine',
    areaMs: 1820,
    areaColour: '14ff18',
    areaAccentColour: 'a3ffba',
    areaBlur: 4.5,
    areaEmbers: 174,
    areaHasFlash: false,
    areaDrops: 59,
    areaDropSpeed: 0.1,
    volleyCount: 2,
    volleyDelay: 130,
  },
  PRIME_150: {
    areaMs: 1700,
    areaImpactMs: 1360,
    areaPad: 115,
    areaColour: 'ec6922',
    areaAccentColour: 'ff8d5c',
    areaBlur: 18,
    areaEmbers: 229,
    areaArms: 5,
    areaTurns: 0.6,
    areaSpin: 1,
    areaWidth: 22,
    burstCount: 35,
  },
  PRIME_162: {
    spotAnchor: 'all-minions',
    spotStagger: 50,
    spotLife: 700,
    spotRadius: 90,
    spotRings: 1,
    spotWidth: 5,
    spotSides: 36,
    spotRingsMotion: 'descend',
    spotDescendStart: 90,
    spotDescendEnd: 90,
    spotRingSquash: 0.35,
    spotFillAlpha: 0.12,
    spotRingBlur: 3,
    spotColour: 'ffd76a',
    spotHasGlow: false,
    spotHasSparks: false,
  },
  PRIME_167: {
    travelMs: 400,
    travelHaloScale: 1.2,
    travelCoreScale: 1.5,
    travelPulse: 0.13,
    travelArc: 0.16,
    travelEase: 1,
    travelColour: '297bff',
    travelStretch: 1.7,
    travelHasStreamers: true,
    travelStreamerCount: 4,
    travelStreamerLength: 114,
    travelStreamerWave: 11,
    travelStreamerFlail: 0.8,
    travelStreamerWidth: 4.5,
    travelStreamerAlpha: 0.35,
    travelStreamerGrow: 200,
    travelStreamerLinger: 500,
    travelStreamerColour: 'ffffff',
    travelTrailPerFrame: 8,
    travelTrailLife: 470,
    travelTrailScale: 0.25,
    travelTrailSpread: 6,
    travelTrailDrift: 0.17,
    travelTrailColour: '85caff',
    burstCount: 40,
    burstLife: 680,
    burstScale: 0.5,
  },
  PRIME_172: {
    spotLife: 1100,
    spotRadius: 89,
    spotRings: 1,
    spotRingGap: 300,
    spotWidth: 5,
    spotSides: 3,
    spotRingsMotion: 'in',
    spotFillAlpha: 0.42,
    spotColour: 'd872fd',
    spotAccentColour: '9147ff',
    spotGlowScale: 5,
    spotSparkCount: 28,
    spotSparkMotion: 'inward',
    spotSparkSpeed: 0.02,
    spotSparkLife: 900,
    spotSparkScale: 0.3,
    spotSparkSpread: 73,
  },
  PRIME_191: {
    travelMs: 170,
    travelArc: 0.21,
    travelHasSprite: true,
    sprite: 'dagger-bone',
    spriteSize: 80,
    spriteTurn: -1,
    spriteDepth: 18,
    spriteStick: 770,
    spriteFade: 630,
    travelTrailPerFrame: 1,
    travelTrailLife: 490,
    travelTrailScale: 0.15,
    travelTrailSpread: 8,
    travelTrailDrift: 0.12,
    travelTrailColour: 'bfbfbf',
    volleyDelay: 100,
    burstCount: 6,
    burstScale: 0.4,
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
  PRIME_202: {
    strikeStyle: 'beam',
    strikeAngle: 30,
    strikeBeamGrow: 100,
    strikeMs: 800,
    strikeLife: 170,
    strikeWidth: 3,
    strikeColour: 'ffe9a0',
    strikeHasForks: false,
    strikeScreenFlash: 0.04,
    volleyCount: 3,
    volleyDelay: 5,
  },
  PRIME_218: {
    travelArc: 0.2,
    travelEase: 0.7,
    travelColour: '186ffb',
    travelTrailColour: '29fbff',
    burstCount: 3,
    burstScale: 0.3,
  },
  PRIME_230: {
    travelMs: 170,
    travelArc: 0.06,
    sprite: 'dagger-purple',
    spriteSize: 45,
    spriteTurn: -15,
    spriteDepth: 4,
    travelHasStreamers: true,
    travelTrailPerFrame: 1,
    travelTrailLife: 490,
    travelTrailScale: 0.15,
    travelTrailSpread: 8,
    travelTrailDrift: 0.12,
    travelTrailColour: 'bfbfbf',
    volleyDelay: 100,
    burstCount: 6,
    burstScale: 0.4,
  },
  PRIME_234: {
    travelMs: 240,
    travelHaloScale: 3,
    travelCoreScale: 0.95,
    travelPulse: 0.11,
    travelArc: 0.12,
    travelEase: 2.7,
    travelColour: 'ed5135',
    travelStretch: 1.4,
    travelHasStreamers: true,
    travelStreamerCount: 16,
    travelStreamerLength: 500,
    travelStreamerWave: 45,
    travelStreamerFlail: 0.8,
    travelStreamerSpread: 81,
    travelStreamerWidth: 20,
    travelStreamerAlpha: 0.5,
    travelStreamerGrow: 1000,
    travelStreamerLinger: 980,
    travelStreamerColour: 'ff7300',
    travelTrailPerFrame: 8,
    travelTrailLife: 900,
    travelTrailScale: 1.5,
    travelTrailSpread: 24,
    travelTrailDrift: 0.2,
    travelTrailColour: 'b5552c',
    burstCount: 40,
    burstLife: 680,
    burstScale: 0.5,
  },
  PRIME_240: {
    sprite: 'axe-double',
    spriteSize: 78,
    strikeAngle: 28,
    strikeMs: 300,
    strikeColour: 'cf5c2a',
    strikeHasSprite: true,
    strikeScreenFlash: 0.02,
  },
  PRIME_245: {
    travelMs: 1200,
    travelHaloScale: 2.25,
    travelCoreScale: 1,
    travelPulse: 0.1,
    travelArc: 0.4,
    travelEase: 0.5,
    travelStretch: 1.5,
    travelHasStreamers: true,
    travelStreamerCount: 16,
    travelStreamerLength: 100,
    travelStreamerWave: 14,
    travelStreamerFlail: 0.8,
    travelStreamerSpread: 15,
    travelStreamerWidth: 6.5,
    travelStreamerAlpha: 0.25,
    travelStreamerGrow: 480,
    travelStreamerLinger: 740,
    travelStreamerColour: 'c4a50e',
    travelTrailPerFrame: 1,
    travelTrailLife: 900,
    travelTrailScale: 1.5,
    travelTrailSpread: 0,
    travelTrailDrift: 0.06,
    burstCount: 46,
    burstLife: 930,
    burstScale: 0.4,
  },
  PRIME_257: {
    strikeAngle: 53,
    strikeJitter: 40,
    strikeSway: 310,
    strikeLife: 480,
    strikeReroll: 40,
    strikeDropout: 0.4,
    strikeGlowScale: 3.4,
    strikeColour: '2a67cf',
    strikeBranchReach: 74,
    strikeScreenFlash: 0.15,
    volleyCount: 2,
    volleyDelay: 55,
    burstCount: 31,
    burstLife: 1200,
  },
  PRIME_265: {
    travelMs: 170,
    travelArc: 0.06,
    travelHasSprite: true,
    sprite: 'dagger-pale',
    spriteSize: 60,
    spriteTurn: -15,
    spriteDepth: 4,
    travelTrailPerFrame: 1,
    travelTrailLife: 490,
    travelTrailScale: 0.15,
    travelTrailSpread: 8,
    travelTrailDrift: 0.12,
    travelTrailColour: 'bfbfbf',
    volleyCount: 2,
    volleyDelay: 400,
    burstCount: 6,
    burstScale: 0.4,
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

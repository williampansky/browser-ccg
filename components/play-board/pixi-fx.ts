import {
  Application,
  BLEND_MODES,
  BlurFilter,
  Graphics,
  LINE_CAP,
  LINE_JOIN,
  Sprite,
  Texture,
} from 'pixi.js';

import type { FlashTone } from './motion';
import { SPELL_FX_SPRITES, spriteById, spriteUrl } from './spell-fx-sprites';
import { colourNumber, SPELL_FX_DEFAULTS } from './spell-fx-tune';
import type { SpellFxTune } from './spell-fx-tune';

/** A point in screen pixels. */
export interface FxPoint {
  x: number;
  y: number;
}

/** A rectangle in screen pixels (top-left corner and size). */
export interface FxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The effects layer: one transparent canvas over the whole page, drawing
 * particles. Everything here is cosmetic; the DOM versions in `motion.ts` are
 * the fallback while this is not loaded.
 */
export interface PixiFx {
  /** An orb with a particle trail flying `from` to `to` in `ms`. */
  travel: (from: FxPoint, to: FxPoint, ms: number, tune: SpellFxTune) => void;
  /** A bolt from the top of the screen striking `to` after `ms`. */
  strike: (to: FxPoint, ms: number, tune: SpellFxTune) => void;
  /** Rings opening around `at`: an effect centred on a place. */
  spot: (at: FxPoint, tune: SpellFxTune) => void;
  /** A swirl or sweep over a region of the board (a global spell). */
  area: (rect: FxRect, tune: SpellFxTune) => void;
  /** A ring of sparks at `at`, coloured by `tone`. */
  burst: (at: FxPoint, tone: FlashTone, tune?: SpellFxTune) => void;
  /**
   * Plays everything at this fraction of real time (1 = normal): for the lab's
   * slow-motion preview. The effects' own milliseconds do not change.
   */
  setSpeed: (speed: number) => void;
  /** Removes the canvas and frees the GPU resources. */
  destroy: () => void;
}

interface Particle {
  age: number;
  life: number;
  scale: number;
  sprite: Sprite;
  vx: number;
  vy: number;
}

const TONE_COLOUR: Record<FlashTone, number> = {
  hit: 0xffd27a,
  heal: 0x4dff7a,
  buff: 0xffd23f,
};
const SOFT_TEXTURE_SIZE = 32;
const SOFT_RINGS = 8;
const GLOW_ALPHA = 0.12;
const TRAVEL_PULSE_RATE = 0.035;
const BURST_SPEED_MIN = 0.12;
const BURST_SPEED_RANGE = 0.18;
/** How far from a picture's centre its point is, as a fraction of its width. */
const SPRITE_REACH = 0.7;
/** The least a picture must move in a frame before it turns to face it. */
const SPRITE_TURN_MIN = 0.5;
const AREA_MIN_DROP_SPEED = 0.05;
const AREA_RAIN_SWAY = 0.04;
const AREA_MIN_RING_MS = 200;
const AREA_SHOCK_REACH = 1.15;
const AREA_SHOCK_THIN = 0.6;
const AREA_SHOCK_FILL = 0.14;
const AREA_SEGMENTS = 44;
const AREA_FADE_IN = 0.2;
const AREA_FADE_OUT = 0.3;
/** How much of an arm, from its rim end, fades in. */
const AREA_RIM_FADE = 0.14;
const AREA_GROW_FROM = 0.55;
const AREA_GROW_BY = 0.35;
const AREA_GLOW_WIDTH = 2.4;
const AREA_GLOW_ALPHA = 0.3;
const AREA_EMBER_LIFE_MS = 520;
const AREA_EMBER_SCALE = 0.32;
const AREA_EMBER_DRIFT = 0.05;
const AREA_WAVE_EDGE = 14;
const AREA_WAVE_RIPPLE = 0.045;
const AREA_WAVE_SPEED = 0.012;
const AREA_MIN_SIDE = 220;
/** A spot picture: its first size (fraction), and how long it pops and fades. */
const SPOT_PICTURE_FROM = 0.6;
const SPOT_PICTURE_POP = 0.25;
const SPOT_PICTURE_FADE_IN = 0.2;
const SPOT_PICTURE_FADE_OUT = 0.35;
const SPOT_START_RADIUS = 16;
const SPOT_RING_FADE = 0.7;
const SPOT_GLOW_ALPHA = 0.8;
const SPOT_RISE_STAGGER = 0.7;
const SPOT_RISE_SWAY = 0.03;
const SPOT_PULSE_SWELL = 0.4;
const Z_INDEX = 8999;

/** A soft white dot, built from stacked translucent circles. */
const softTexture = (app: Application): Texture => {
  const dot = new Graphics();
  const centre = SOFT_TEXTURE_SIZE / 2;
  for (let ring = SOFT_RINGS; ring > 0; ring--) {
    dot.beginFill(0xffffff, GLOW_ALPHA);
    dot.drawCircle(centre, centre, (centre * ring) / SOFT_RINGS);
    dot.endFill();
  }
  return app.renderer.generateTexture(dot);
};

const STRIKE_CORE = 0xffffff;
/** How hard a falling picture speeds up (1 = steady). */
const STRIKE_FALL_POWER = 2.2;
const STRIKE_OVERSHOOT = 30;
const BRANCH_SEGMENTS = 5;
const BRANCH_WIDTH = 0.45;
const SCREEN_FLASH_MS = 140;
/** The glow layers of a bolt, widest and faintest first. */
const BOLT_LAYERS: { alpha: number; isCore: boolean; width: number }[] = [
  { alpha: 0.18, isCore: false, width: 26 },
  { alpha: 0.45, isCore: false, width: 11 },
  { alpha: 1, isCore: true, width: 4 },
];

/**
 * A jagged line from `from` to `to`. The sideways kick shrinks toward the end
 * so the bolt lands exactly on its target.
 */
const jaggedPath = (
  from: FxPoint,
  to: FxPoint,
  segments: number,
  jitter: number,
): FxPoint[] => {
  const points: FxPoint[] = [from];
  for (let step = 1; step < segments; step++) {
    const along = step / segments;
    const kick = (Math.random() - 0.5) * 2 * jitter * (1 - along * along);
    points.push({
      x: from.x + (to.x - from.x) * along + kick,
      y: from.y + (to.y - from.y) * along,
    });
  }
  points.push(to);
  return points;
};

/** A few short forks that leave the main bolt and wander downward. */
const makeBranches = (path: FxPoint[], tune: SpellFxTune): FxPoint[][] => {
  const { strikeBranches, strikeBranchReach, strikeJitter } = tune;
  if (!tune.strikeHasForks) return [];
  const branches: FxPoint[][] = [];
  for (let index = 0; index < Math.round(strikeBranches); index++) {
    const fork = path[2 + Math.floor(Math.random() * (path.length - 5))];
    const side = Math.random() < 0.5 ? -1 : 1;
    const end = {
      x: fork.x + side * (strikeBranchReach * (0.4 + Math.random() * 0.6)),
      y: fork.y + strikeBranchReach * (0.3 + Math.random() * 0.6),
    };
    branches.push(jaggedPath(fork, end, BRANCH_SEGMENTS, strikeJitter / 2));
  }
  return branches;
};

/** The corners of a regular polygon, one point up. */
const polygon = (at: FxPoint, radius: number, sides: number): FxPoint[] => {
  const corners = Math.max(3, Math.round(sides));
  const points: FxPoint[] = [];
  for (let corner = 0; corner < corners; corner++) {
    const angle = (corner / corners) * Math.PI * 2 - Math.PI / 2;
    points.push({
      x: at.x + Math.cos(angle) * radius,
      y: at.y + Math.sin(angle) * radius,
    });
  }
  return points;
};

/** Strokes a path in glow layers, widest and faintest first. */
const drawBolt = (
  graphics: Graphics,
  path: FxPoint[],
  widthScale: number,
  alpha: number,
  tune: SpellFxTune,
): void => {
  const { strikeColour, strikeWidth } = tune;
  for (const layer of BOLT_LAYERS) {
    graphics.lineStyle({
      alpha: layer.alpha * alpha,
      cap: LINE_CAP.ROUND,
      color: layer.isCore ? STRIKE_CORE : colourNumber(strikeColour),
      join: LINE_JOIN.ROUND,
      width: layer.width * widthScale * strikeWidth,
    });
    graphics.moveTo(path[0].x, path[0].y);
    for (const point of path.slice(1)) graphics.lineTo(point.x, point.y);
  }
};

interface SparkLaunch {
  delay: number;
  from: FxPoint;
  vx: number;
  vy: number;
}

/**
 * Where each spot spark starts, when, and how fast it moves: outward from the
 * spot, rising (scattered over a disc, staggered like drifting motes) or
 * inward from a circle.
 */
const makeSparks = (
  at: FxPoint,
  tune: SpellFxTune,
  count: number,
): SparkLaunch[] => {
  const { spotSparkMotion: motion, spotSparkSpeed: speed } = tune;
  const launches: SparkLaunch[] = [];
  for (let spark = 0; spark < count; spark++) {
    const angle = (spark / count) * Math.PI * 2;
    const scatter = tune.spotSparkSpread * Math.sqrt(Math.random());
    const around = Math.random() * Math.PI * 2;
    const disc = {
      x: at.x + Math.cos(around) * scatter,
      y: at.y + Math.sin(around) * scatter,
    };
    if (motion === 'rising') {
      launches.push({
        delay: Math.random() * tune.spotLife * SPOT_RISE_STAGGER,
        from: disc,
        vx: (Math.random() - 0.5) * SPOT_RISE_SWAY,
        vy: -speed,
      });
    } else if (motion === 'inward') {
      const reach = tune.spotSparkSpread || tune.spotRadius;
      const ring = {
        x: at.x + Math.cos(angle) * reach,
        y: at.y + Math.sin(angle) * reach,
      };
      launches.push({
        delay: 0,
        from: ring,
        vx: -Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
      });
    } else {
      launches.push({
        delay: 0,
        from: disc,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
  }
  return launches.sort((a, b) => a.delay - b.delay);
};

/** A ring's radius and opacity at `age` (0 to 1) for the tune's motion. */
const ringState = (
  age: number,
  tune: SpellFxTune,
): { alpha: number; radius: number } => {
  const open = 1 - Math.pow(1 - age, 3);
  const reach = tune.spotRadius - SPOT_START_RADIUS;
  if (tune.spotRingsMotion === 'in') {
    return {
      alpha: Math.sin(Math.PI * age),
      radius: tune.spotRadius - reach * open,
    };
  }
  if (tune.spotRingsMotion === 'pulse') {
    const swell =
      1 - SPOT_PULSE_SWELL + SPOT_PULSE_SWELL * Math.sin(Math.PI * age);
    return {
      alpha: Math.sin(Math.PI * age),
      radius: SPOT_START_RADIUS + reach * swell,
    };
  }
  return { alpha: 1 - age, radius: SPOT_START_RADIUS + reach * open };
};

/** A colour part way from `a` to `b` (0 = a, 1 = b). */
const mixColour = (a: number, b: number, t: number): number => {
  const channel = (shift: number): number => {
    const from = (a >> shift) & 0xff;
    const to = (b >> shift) & 0xff;
    return Math.round(from + (to - from) * t);
  };
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
};

/**
 * The effect's strength over its life: it fades in, holds, then fades out
 * (`age` runs 0 to 1).
 */
const areaEnvelope = (age: number): number =>
  Math.max(0, Math.min(1, age / AREA_FADE_IN, (1 - age) / AREA_FADE_OUT));

/** A point on a swirl arm: `t` 0 at the rim, 1 at the eye. */
const swirlPoint = (
  rect: FxRect,
  arm: number,
  t: number,
  grow: number,
  spin: number,
  tune: SpellFxTune,
): FxPoint => {
  const angle =
    (arm / Math.max(1, Math.round(tune.areaArms))) * Math.PI * 2 +
    spin +
    t * tune.areaTurns * Math.PI * 2;
  const reach = (1 - t) * grow;
  return {
    x: rect.x + rect.width / 2 + Math.cos(angle) * (rect.width / 2) * reach,
    y: rect.y + rect.height / 2 + Math.sin(angle) * (rect.height / 2) * reach,
  };
};

/** Draws one frame of the swirl: arms of fire spiralling in to the eye. */
const drawSwirl = (
  graphics: Graphics,
  rect: FxRect,
  age: number,
  elapsedMs: number,
  tune: SpellFxTune,
): void => {
  const body = colourNumber(tune.areaColour);
  const edge = colourNumber(tune.areaAccentColour);
  const envelope = areaEnvelope(age);
  const grow =
    AREA_GROW_FROM +
    AREA_GROW_BY * (1 - Math.pow(1 - Math.min(1, age / AREA_GROW_BY), 3));
  const spin = (elapsedMs / 1000) * tune.areaSpin * Math.PI * 2;
  graphics.clear();
  const arms = Math.max(1, Math.round(tune.areaArms));
  for (let arm = 0; arm < arms; arm++) {
    for (let segment = 0; segment < AREA_SEGMENTS; segment++) {
      const from = segment / AREA_SEGMENTS;
      const start = swirlPoint(rect, arm, from, grow, spin, tune);
      const finish = swirlPoint(
        rect,
        arm,
        (segment + 1) / AREA_SEGMENTS,
        grow,
        spin,
        tune,
      );
      const width = tune.areaWidth * (0.3 + 0.7 * (1 - from));
      const colour = mixColour(edge, body, from);
      // Each arm fades in from its rim end, so it has no hard cut-off.
      const soften = Math.min(1, from / AREA_RIM_FADE);
      const alpha = envelope * soften * (0.25 + 0.75 * (1 - from));
      for (const layer of [
        { alpha: alpha * AREA_GLOW_ALPHA, width: width * AREA_GLOW_WIDTH },
        { alpha, width },
      ]) {
        graphics.lineStyle({
          alpha: layer.alpha,
          cap: LINE_CAP.BUTT,
          color: colour,
          width: layer.width,
        });
        graphics.moveTo(start.x, start.y);
        graphics.lineTo(finish.x, finish.y);
      }
    }
  }
};

/** Draws one frame of the sweep: a wavy band of fire crossing the region. */
const drawSweep = (
  graphics: Graphics,
  rect: FxRect,
  age: number,
  elapsedMs: number,
  tune: SpellFxTune,
): void => {
  const body = colourNumber(tune.areaColour);
  const edge = colourNumber(tune.areaAccentColour);
  const envelope = areaEnvelope(age);
  graphics.clear();
  const fronts: number[] =
    tune.areaDirection === 'out'
      ? [
          rect.x + rect.width / 2 + (age * rect.width) / 2,
          rect.x + rect.width / 2 - (age * rect.width) / 2,
        ]
      : [
          tune.areaDirection === 'left'
            ? rect.x + rect.width * (1 - age)
            : rect.x + rect.width * age,
        ];
  for (const front of fronts) {
    for (const layer of [
      { alpha: 0.2, colour: body, width: tune.areaWaveWidth * 2.2 },
      {
        alpha: 0.45,
        colour: mixColour(body, edge, 0.5),
        width: tune.areaWaveWidth * 1.2,
      },
      { alpha: 0.85, colour: edge, width: tune.areaWaveWidth * 0.45 },
    ]) {
      const rows = 24;
      const left: FxPoint[] = [];
      const right: FxPoint[] = [];
      for (let row = 0; row <= rows; row++) {
        const y = rect.y + (rect.height * row) / rows;
        const ripple =
          Math.sin(y * AREA_WAVE_RIPPLE + elapsedMs * AREA_WAVE_SPEED) *
          AREA_WAVE_EDGE;
        left.push({ x: front - layer.width / 2 + ripple, y });
        right.push({ x: front + layer.width / 2 - ripple, y });
      }
      graphics.beginFill(layer.colour, layer.alpha * envelope);
      graphics.moveTo(left[0].x, left[0].y);
      for (const point of left.slice(1)) graphics.lineTo(point.x, point.y);
      for (const point of right.slice().reverse())
        graphics.lineTo(point.x, point.y);
      graphics.closePath();
      graphics.endFill();
    }
  }
};

/** How far a spinning picture has turned after `elapsedMs`, in radians. */
const spinRadians = (degreesPerSecond: number, elapsedMs: number): number =>
  (degreesPerSecond * (elapsedMs / 1000) * Math.PI) / 180;

/** Draws one frame of the shockwave: rings spreading from the region's middle. */
const drawShockwave = (
  graphics: Graphics,
  rect: FxRect,
  elapsedMs: number,
  tune: SpellFxTune,
): void => {
  const body = colourNumber(tune.areaColour);
  const edge = colourNumber(tune.areaAccentColour);
  const rings = Math.max(1, Math.round(tune.areaRings));
  const ringLife = Math.max(
    AREA_MIN_RING_MS,
    tune.areaMs - (rings - 1) * tune.areaRingGap,
  );
  graphics.clear();
  for (let ring = 0; ring < rings; ring++) {
    const age = (elapsedMs - ring * tune.areaRingGap) / ringLife;
    if (age <= 0 || age >= 1) continue;
    const open = 1 - Math.pow(1 - age, 3);
    const reach = open * AREA_SHOCK_REACH;
    const alpha = Math.pow(1 - age, 1.2);
    const colour = mixColour(edge, body, age);
    graphics.lineStyle({
      alpha,
      color: colour,
      width: Math.max(1, tune.areaWidth * (1 - age * AREA_SHOCK_THIN)),
    });
    graphics.beginFill(colour, AREA_SHOCK_FILL * alpha);
    graphics.drawEllipse(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      (rect.width / 2) * reach,
      (rect.height / 2) * reach,
    );
    graphics.endFill();
  }
};

/** The steepest lean a strike may have from vertical (degrees). */
const STRIKE_MAX_ANGLE = 75;

/**
 * Where a strike starts: above the top of the screen, leaned off vertical by
 * the tune's angle so that it still ends on `to` (plus the random sway).
 */
const strikeOrigin = (to: FxPoint, tune: SpellFxTune): FxPoint => {
  const lean = Math.max(
    -STRIKE_MAX_ANGLE,
    Math.min(STRIKE_MAX_ANGLE, tune.strikeAngle),
  );
  const run = to.y + STRIKE_OVERSHOOT;
  return {
    x:
      to.x -
      Math.tan((lean * Math.PI) / 180) * run +
      (Math.random() - 0.5) * tune.strikeSway,
    y: -STRIKE_OVERSHOOT,
  };
};

interface StreamerLane {
  phase: number;
  reach: number;
  side: number;
  speed: number;
}

const STREAMER_SEGMENTS = 28;
const STREAMER_WAVE_TURNS = 1.1;
const STREAMER_FLAIL_RATE = 0.006;

/**
 * Draws the head's streamers: wavy strands that run back from `head` against
 * its heading, fan out toward their tips and thin and fade as they go, each
 * flailing on its own phase.
 */
const drawStreamers = (
  graphics: Graphics,
  lanes: StreamerLane[],
  head: FxPoint,
  heading: number,
  elapsed: number,
  fadeOut: number,
  tune: SpellFxTune,
): void => {
  const colour = colourNumber(tune.travelStreamerColour);
  // They grow out of the head and fade in over the first moments, not pop in.
  const raw =
    tune.travelStreamerGrow > 0
      ? Math.min(1, elapsed / tune.travelStreamerGrow)
      : 1;
  const grown = 1 - Math.pow(1 - raw, 2);
  const backX = -Math.cos(heading);
  const backY = -Math.sin(heading);
  const sideX = -backY;
  const sideY = backX;
  graphics.clear();
  for (const lane of lanes) {
    const length = tune.travelStreamerLength * lane.reach * grown;
    const point = (along: number): FxPoint => {
      const sway =
        Math.sin(
          lane.phase +
            elapsed *
              STREAMER_FLAIL_RATE *
              tune.travelStreamerFlail *
              lane.speed -
            along * Math.PI * 2 * STREAMER_WAVE_TURNS,
        ) *
        tune.travelStreamerWave *
        along;
      const sideways = lane.side * tune.travelStreamerSpread * along + sway;
      return {
        x: head.x + backX * length * along + sideX * sideways,
        y: head.y + backY * length * along + sideY * sideways,
      };
    };
    for (let segment = 0; segment < STREAMER_SEGMENTS; segment++) {
      const from = segment / STREAMER_SEGMENTS;
      const start = point(from);
      const finish = point((segment + 1) / STREAMER_SEGMENTS);
      graphics.lineStyle({
        alpha: tune.travelStreamerAlpha * (1 - from) * fadeOut * grown,
        cap: LINE_CAP.BUTT,
        color: colour,
        width: Math.max(0.5, tune.travelStreamerWidth * (1 - from)),
      });
      graphics.moveTo(start.x, start.y);
      graphics.lineTo(finish.x, finish.y);
    }
  }
};

/** Creates the overlay canvas and its particle systems. */
export const createPixiFx = (): PixiFx => {
  const app = new Application({
    antialias: true,
    autoDensity: true,
    backgroundAlpha: 0,
    resizeTo: window,
    resolution: window.devicePixelRatio || 1,
  });
  const canvas = app.view as HTMLCanvasElement;
  Object.assign(canvas.style, {
    left: '0',
    pointerEvents: 'none',
    position: 'fixed',
    top: '0',
    zIndex: String(Z_INDEX),
  });
  document.body.appendChild(canvas);
  const texture = softTexture(app);
  // Load the pictures now so the first cast does not wait for them.
  for (const art of SPELL_FX_SPRITES) Texture.from(spriteUrl(art.id));
  const particles: Particle[] = [];
  let playbackSpeed = 1;
  /** Runs per-frame jobs (an orb in flight); the ticker sleeps with none. */
  const jobs = new Set<(deltaMs: number) => boolean>();

  /**
   * Pixi 7's types do not line up with this repo's TypeScript (its event
   * emitter typings clash), so the one cast lives here.
   */
  const addToStage = (sprite: Sprite): void => {
    app.stage.addChild(sprite as never);
  };

  const wake = (): void => {
    if (!app.ticker.started) app.ticker.start();
  };

  const spawn = (
    at: FxPoint,
    colour: number,
    scale: number,
    life: number,
    vx: number,
    vy: number,
  ): void => {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.tint = colour;
    sprite.blendMode = BLEND_MODES.ADD;
    sprite.position.set(at.x, at.y);
    sprite.scale.set(scale);
    addToStage(sprite);
    particles.push({ age: 0, life, scale, sprite, vx, vy });
  };

  const step = (): void => {
    const deltaMs = app.ticker.deltaMS * playbackSpeed;
    for (const job of Array.from(jobs)) if (!job(deltaMs)) jobs.delete(job);
    for (let index = particles.length - 1; index >= 0; index--) {
      const particle = particles[index];
      const { sprite } = particle;
      particle.age += deltaMs;
      const left = 1 - particle.age / particle.life;
      if (left <= 0) {
        sprite.destroy();
        particles.splice(index, 1);
        continue;
      }
      sprite.x += particle.vx * deltaMs;
      sprite.y += particle.vy * deltaMs;
      sprite.alpha = left;
      sprite.scale.set(particle.scale * left);
    }
    if (jobs.size === 0 && particles.length === 0) app.ticker.stop();
  };
  app.ticker.add(step);
  app.ticker.stop();

  const burstWith = (
    at: FxPoint,
    tone: FlashTone,
    tune: SpellFxTune,
    override?: number,
  ): void => {
    const { burstCount, burstLife, burstScale } = tune;
    const colour = override ?? TONE_COLOUR[tone];
    const count = Math.round(burstCount);
    for (let spark = 0; spark < count; spark++) {
      const angle = (spark / count) * Math.PI * 2 + Math.random();
      const speed = BURST_SPEED_MIN + Math.random() * BURST_SPEED_RANGE;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      spawn(at, colour, burstScale, burstLife, vx, vy);
    }
    wake();
  };

  const travel = (
    from: FxPoint,
    to: FxPoint,
    ms: number,
    tune: SpellFxTune,
  ): void => {
    const isSprite = tune.travelHasSprite;
    const art = spriteById(tune.sprite);
    const size = tune.spriteSize;
    const tipRadians = ((art.tip + tune.spriteTurn) * Math.PI) / 180;
    // A picture lands a little off the target's centre, point first: the path
    // ends where its centre will be, a blade's length back from the spot.
    const scatterAngle = Math.random() * Math.PI * 2;
    const scatterRadius = tune.spriteScatter * Math.sqrt(Math.random());
    const hit = isSprite
      ? {
          x: to.x + Math.cos(scatterAngle) * scatterRadius,
          y: to.y + Math.sin(scatterAngle) * scatterRadius,
        }
      : to;
    const aimX = hit.x - from.x;
    const aimY = hit.y - from.y;
    const aimLength = Math.hypot(aimX, aimY) || 1;
    const back = isSprite ? tune.spriteDepth - size * SPRITE_REACH : 0;
    const end = {
      x: hit.x + (aimX / aimLength) * back,
      y: hit.y + (aimY / aimLength) * back,
    };
    const halo = new Sprite(texture);
    const core = new Sprite(texture);
    halo.tint = colourNumber(tune.travelColour);
    core.tint = 0xffffff;
    const picture = new Sprite(Texture.from(spriteUrl(art.id)));
    picture.anchor.set(0.5);
    const heads = isSprite ? [picture] : [halo, core];
    for (const part of heads) {
      if (part !== picture) {
        part.anchor.set(0.5);
        part.blendMode = BLEND_MODES.ADD;
      }
      addToStage(part);
    }
    const dx = end.x - from.x;
    const dy = end.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    // A gentle sideways arc, so a shot is not a ruler line.
    const arcX = (-dy / distance) * distance * tune.travelArc;
    const arcY = (dx / distance) * distance * tune.travelArc;
    // Wispy streamers that flail off behind the head (drawn fresh each frame).
    const streamers = tune.travelHasStreamers ? new Graphics() : null;
    if (streamers) {
      streamers.blendMode = BLEND_MODES.ADD;
      app.stage.addChild(streamers as never);
    }
    const lanes = Array.from(
      { length: Math.round(tune.travelStreamerCount) },
      () => ({
        phase: Math.random() * Math.PI * 2,
        reach: 0.55 + Math.random() * 0.45,
        side: Math.random() * 2 - 1,
        speed: 0.7 + Math.random() * 0.6,
      }),
    );
    let elapsed = 0;
    let last = from;
    let heading = Math.atan2(dy, dx);
    let arrivedAt: number | null = null;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      const linear = Math.min(1, elapsed / ms);
      const eased = Math.pow(linear, tune.travelEase);
      const bend = Math.sin(Math.PI * eased);
      const at = {
        x: from.x + dx * eased + arcX * bend,
        y: from.y + dy * eased + arcY * bend,
      };
      // The point leads: face the way the head is moving.
      if (Math.hypot(at.x - last.x, at.y - last.y) > SPRITE_TURN_MIN) {
        heading = Math.atan2(at.y - last.y, at.x - last.x);
      }
      if (arrivedAt === null) {
        if (isSprite) {
          picture.position.set(at.x, at.y);
          picture.rotation =
            heading - tipRadians + spinRadians(tune.spriteSpin, elapsed);
          picture.width = size;
          picture.height = size;
        } else {
          const pulse =
            1 + tune.travelPulse * Math.sin(elapsed * TRAVEL_PULSE_RATE);
          halo.position.set(at.x, at.y);
          core.position.set(at.x, at.y);
          // A stretched head turns along the flight, like a beam's point.
          halo.rotation = heading;
          core.rotation = heading;
          halo.scale.set(
            tune.travelHaloScale * pulse * tune.travelStretch,
            tune.travelHaloScale * pulse,
          );
          core.scale.set(
            tune.travelCoreScale * pulse * tune.travelStretch,
            tune.travelCoreScale * pulse,
          );
        }
        const puffs = tune.travelHasTrail
          ? Math.round(tune.travelTrailPerFrame)
          : 0;
        for (let puff = 0; puff < puffs; puff++) {
          const jitter = () => (Math.random() - 0.5) * tune.travelTrailSpread;
          const drift = () => (Math.random() - 0.5) * tune.travelTrailDrift;
          // Spread the puffs along the way since the last frame, so a fast
          // orb leaves a stream and not a row of dots.
          const behind = puff / Math.max(1, puffs);
          const origin = {
            x: at.x + (last.x - at.x) * behind + jitter(),
            y: at.y + (last.y - at.y) * behind + jitter(),
          };
          spawn(
            origin,
            colourNumber(tune.travelTrailColour),
            tune.travelTrailScale,
            tune.travelTrailLife,
            drift(),
            drift(),
          );
        }
        last = at;
      }
      if (linear >= 1 && arrivedAt === null) {
        arrivedAt = elapsed;
        halo.destroy();
        core.destroy();
        burstWith(hit, 'hit', tune);
      }
      const held = arrivedAt === null ? 0 : elapsed - arrivedAt;
      // A picture sticks in the target, stays a moment, then fades away.
      const pictureLeft = isSprite
        ? tune.spriteStick + tune.spriteFade - held
        : 0;
      if (isSprite && arrivedAt !== null) {
        const fade = Math.max(1, tune.spriteFade);
        picture.alpha =
          held <= tune.spriteStick
            ? 1
            : Math.max(0, 1 - (held - tune.spriteStick) / fade);
      }
      // The streamers keep flailing a moment after the hit, fading out.
      const streamersLeft = streamers ? tune.travelStreamerLinger - held : 0;
      if (streamers) {
        const fadeOut =
          arrivedAt === null
            ? 1
            : Math.max(
                0,
                streamersLeft / Math.max(1, tune.travelStreamerLinger),
              );
        drawStreamers(streamers, lanes, at, heading, elapsed, fadeOut, tune);
      }
      if (arrivedAt === null) return true;
      if (pictureLeft > 0 || streamersLeft > 0) return true;
      picture.destroy();
      streamers?.destroy();
      return false;
    });
    wake();
  };

  /**
   * A picture falls from above point-first onto `to`, sticks in, then fades:
   * the strike with an axe, a spear or a shard in place of the bolt.
   */
  const strikePicture = (to: FxPoint, ms: number, tune: SpellFxTune): void => {
    const art = spriteById(tune.sprite);
    const size = tune.spriteSize;
    const tipRadians = ((art.tip + tune.spriteTurn) * Math.PI) / 180;
    const picture = new Sprite(Texture.from(spriteUrl(art.id)));
    picture.anchor.set(0.5);
    addToStage(picture);
    const scatterAngle = Math.random() * Math.PI * 2;
    const scatterRadius = tune.spriteScatter * Math.sqrt(Math.random());
    const hit = {
      x: to.x + Math.cos(scatterAngle) * scatterRadius,
      y: to.y + Math.sin(scatterAngle) * scatterRadius,
    };
    // The point leads along the way it falls (leaned by the angle); the centre
    // ends a blade's length back from the spot.
    const origin = strikeOrigin(hit, tune);
    const fallX = hit.x - origin.x;
    const fallY = hit.y - origin.y;
    const fallLength = Math.hypot(fallX, fallY) || 1;
    const heading = Math.atan2(fallY, fallX);
    const back = size * SPRITE_REACH - tune.spriteDepth;
    const endX = hit.x - (fallX / fallLength) * back;
    const endY = hit.y - (fallY / fallLength) * back;
    const startX = origin.x - (fallX / fallLength) * size;
    const startY = origin.y - (fallY / fallLength) * size;
    const duration = Math.max(1, ms);
    let elapsed = 0;
    let arrivedAt: number | null = null;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      const linear = Math.min(1, elapsed / duration);
      const fall = Math.pow(linear, STRIKE_FALL_POWER);
      if (arrivedAt === null) {
        picture.position.set(
          startX + (endX - startX) * fall,
          startY + (endY - startY) * fall,
        );
        picture.rotation =
          heading - tipRadians + spinRadians(tune.spriteSpin, elapsed);
        picture.width = size;
        picture.height = size;
      }
      if (linear >= 1 && arrivedAt === null) {
        arrivedAt = elapsed;
        burstWith(hit, 'hit', tune, colourNumber(tune.strikeColour));
        if (tune.strikeHasFlash) flashScreen(tune.strikeScreenFlash);
      }
      if (arrivedAt === null) return true;
      const held = elapsed - arrivedAt;
      const fade = Math.max(1, tune.spriteFade);
      picture.alpha =
        held <= tune.spriteStick
          ? 1
          : Math.max(0, 1 - (held - tune.spriteStick) / fade);
      if (held < tune.spriteStick + tune.spriteFade) return true;
      picture.destroy();
      return false;
    });
    wake();
  };

  const strike = (to: FxPoint, ms: number, tune: SpellFxTune): void => {
    if (tune.strikeHasSprite) {
      strikePicture(to, ms, tune);
      return;
    }
    const colour = colourNumber(tune.strikeColour);
    const isBeam = tune.strikeStyle === 'beam';
    // A jagged bolt, or (for a beam) a straight line that grows to the target.
    const newPath = (origin: FxPoint): FxPoint[] =>
      isBeam
        ? [origin, to]
        : jaggedPath(
            origin,
            to,
            Math.round(tune.strikeSegments),
            tune.strikeJitter,
          );
    const bolt = new Graphics();
    bolt.blendMode = BLEND_MODES.ADD;
    app.stage.addChild(bolt as never);
    const glow = new Sprite(texture);
    glow.anchor.set(0.5);
    glow.tint = colour;
    glow.blendMode = BLEND_MODES.ADD;
    glow.position.set(to.x, to.y);
    addToStage(glow);
    const origin = strikeOrigin(to, tune);
    let path = newPath(origin);
    let branches = isBeam ? [] : makeBranches(path, tune);
    let elapsed = 0;
    let isStruck = false;
    let reroll = 0;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      // Before the strike a glow gathers where it will land.
      if (elapsed < ms) {
        glow.scale.set(tune.strikeGlowScale * (elapsed / ms));
        glow.alpha = elapsed / ms;
        return true;
      }
      const since = elapsed - ms;
      // A beam takes a moment to reach the target; its hit lands then.
      const reach =
        isBeam && tune.strikeBeamGrow > 0
          ? Math.min(1, since / tune.strikeBeamGrow)
          : 1;
      if (!isStruck && reach >= 1) {
        isStruck = true;
        burstWith(to, 'hit', tune, colour);
        if (tune.strikeHasFlash) flashScreen(tune.strikeScreenFlash);
      }
      const life =
        1 - since / (tune.strikeLife + (isBeam ? tune.strikeBeamGrow : 0));
      if (life <= 0) {
        bolt.destroy();
        glow.destroy();
        return false;
      }
      if (isBeam) {
        path = [
          origin,
          {
            x: origin.x + (to.x - origin.x) * reach,
            y: origin.y + (to.y - origin.y) * reach,
          },
        ];
      } else if (since > reroll) {
        // The bolt re-forms a few times, like a real flicker.
        reroll += tune.strikeReroll;
        path = newPath(origin);
        branches = makeBranches(path, tune);
      }
      const flicker = !isBeam && Math.random() < tune.strikeDropout ? 0.35 : 1;
      const alpha = Math.min(1, life * 1.5) * flicker;
      glow.scale.set(tune.strikeGlowScale * (1 + (1 - life)));
      glow.alpha = alpha;
      bolt.clear();
      drawBolt(bolt, path, 1, alpha, tune);
      for (const branch of branches)
        drawBolt(bolt, branch, BRANCH_WIDTH, alpha, tune);
      return true;
    });
    wake();
  };

  const spot = (at: FxPoint, tune: SpellFxTune): void => {
    const steel = colourNumber(tune.spotColour);
    const gold = colourNumber(tune.spotAccentColour);
    const rings = Math.max(1, Math.round(tune.spotRings));
    const ringsTotal = tune.spotLife + (rings - 1) * tune.spotRingGap;
    const glow = new Sprite(texture);
    glow.anchor.set(0.5);
    glow.tint = steel;
    glow.blendMode = BLEND_MODES.ADD;
    glow.position.set(at.x, at.y);
    addToStage(glow);
    // A picture pops up at the spot (a shield, a skull, a potion) and rises.
    const art = spriteById(tune.sprite);
    const picture = tune.spotHasSprite
      ? new Sprite(Texture.from(spriteUrl(art.id)))
      : null;
    if (picture) {
      picture.anchor.set(0.5);
      picture.alpha = 0;
      addToStage(picture);
    }
    // One layer per ring, so each can have its own blur (the first ring's plus
    // a step per later ring). No blur skips the filter's cost.
    const layers = Array.from({ length: rings }, (_, ring) => {
      const layer = new Graphics();
      layer.blendMode = BLEND_MODES.ADD;
      app.stage.addChild(layer as never);
      const blur = Math.max(
        0,
        tune.spotRingBlur + ring * tune.spotRingBlurStep,
      );
      const softener = blur > 0 ? new BlurFilter(blur) : null;
      if (softener) layer.filters = [softener];
      return { layer, softener };
    });
    const sparkCount = tune.spotHasSparks ? Math.round(tune.spotSparkCount) : 0;
    const sparks = makeSparks(at, tune, sparkCount);
    let sparkIndex = 0;
    const total = Math.max(
      ringsTotal,
      sparks.length ? sparks[sparks.length - 1].delay : 0,
    );
    let elapsed = 0;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      // Sparks are launched when their turn comes (rising ones are staggered).
      while (
        sparkIndex < sparks.length &&
        sparks[sparkIndex].delay <= elapsed
      ) {
        const spark = sparks[sparkIndex++];
        spawn(
          spark.from,
          gold,
          tune.spotSparkScale,
          tune.spotSparkLife,
          spark.vx,
          spark.vy,
        );
      }
      if (elapsed >= total && sparkIndex >= sparks.length) {
        glow.destroy();
        picture?.destroy();
        for (const { layer, softener } of layers) {
          layer.destroy();
          softener?.destroy();
        }
        return false;
      }
      const first = Math.min(1, elapsed / tune.spotLife);
      const opening = 1 - Math.pow(1 - first, 3);
      glow.scale.set(tune.spotGlowScale * (0.4 + 0.6 * opening));
      glow.alpha = tune.spotHasGlow ? SPOT_GLOW_ALPHA * (1 - first) : 0;
      if (picture) {
        const life = Math.min(1, elapsed / tune.spotLife);
        const pop = 1 - Math.pow(1 - Math.min(1, life / SPOT_PICTURE_POP), 3);
        const fadeIn = Math.min(1, life / SPOT_PICTURE_FADE_IN);
        const fadeOut = Math.min(1, (1 - life) / SPOT_PICTURE_FADE_OUT);
        picture.alpha = Math.max(0, Math.min(fadeIn, fadeOut));
        const scale = SPOT_PICTURE_FROM + (1 - SPOT_PICTURE_FROM) * pop;
        picture.width = tune.spriteSize * scale;
        picture.height = tune.spriteSize * scale;
        picture.position.set(at.x, at.y - tune.spotSpriteRise * opening);
        picture.rotation =
          (tune.spriteTurn * Math.PI) / 180 +
          spinRadians(tune.spriteSpin, elapsed);
      }
      for (let ring = 0; ring < rings; ring++) {
        const drawing = layers[ring].layer;
        drawing.clear();
        const age = (elapsed - ring * tune.spotRingGap) / tune.spotLife;
        if (age <= 0 || age >= 1) continue;
        const { alpha, radius } = ringState(age, tune);
        const colour = ring === 0 ? steel : gold;
        const corners = polygon(at, radius, tune.spotSides);
        drawing.lineStyle({
          alpha,
          cap: LINE_CAP.ROUND,
          color: colour,
          join: LINE_JOIN.ROUND,
          width: tune.spotWidth * (1 - age * SPOT_RING_FADE),
        });
        drawing.beginFill(colour, tune.spotFillAlpha * alpha);
        drawing.moveTo(corners[0].x, corners[0].y);
        for (const corner of corners.slice(1))
          drawing.lineTo(corner.x, corner.y);
        drawing.closePath();
        drawing.endFill();
      }
      return true;
    });
    wake();
  };

  /** A sheet of white across the whole screen that fades in a blink. */
  const flashScreen = (strength: number, colour = 0xcfe0ff): void => {
    if (strength <= 0) return;
    const sheet = new Graphics();
    sheet.beginFill(colour, 1);
    sheet.drawRect(0, 0, window.innerWidth, window.innerHeight);
    sheet.endFill();
    sheet.blendMode = BLEND_MODES.ADD;
    sheet.alpha = strength;
    app.stage.addChild(sheet as never);
    let age = 0;
    jobs.add((deltaMs) => {
      age += deltaMs;
      sheet.alpha = strength * (1 - age / SCREEN_FLASH_MS);
      if (age < SCREEN_FLASH_MS) return true;
      sheet.destroy();
      return false;
    });
  };

  const burst = (
    at: FxPoint,
    tone: FlashTone,
    tune: SpellFxTune = SPELL_FX_DEFAULTS,
  ): void => burstWith(at, tone, tune);

  const area = (rect: FxRect, tune: SpellFxTune): void => {
    const graphics = new Graphics();
    graphics.blendMode = BLEND_MODES.ADD;
    app.stage.addChild(graphics as never);
    const softener = tune.areaBlur > 0 ? new BlurFilter(tune.areaBlur) : null;
    if (softener) graphics.filters = [softener];
    const body = colourNumber(tune.areaColour);
    const edge = colourNumber(tune.areaAccentColour);
    if (tune.areaHasFlash) flashScreen(tune.areaFlash, edge);
    let elapsed = 0;
    let owed = 0;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      const age = Math.min(1, elapsed / tune.areaMs);
      if (tune.areaStyle === 'sweep')
        drawSweep(graphics, rect, age, elapsed, tune);
      else if (tune.areaStyle === 'shockwave')
        drawShockwave(graphics, rect, elapsed, tune);
      else if (tune.areaStyle === 'rain') graphics.clear();
      else drawSwirl(graphics, rect, age, elapsed, tune);
      // Embers ride the effect: a few new ones each frame, on the arms or in
      // the band. Rain is made of falling (or rising) drops instead.
      const isRain = tune.areaStyle === 'rain';
      owed += ((isRain ? tune.areaDrops : tune.areaEmbers) * deltaMs) / 1000;
      const envelope = areaEnvelope(age);
      while (owed >= 1 && envelope > 0) {
        owed -= 1;
        if (isRain) {
          const speed = Math.max(AREA_MIN_DROP_SPEED, tune.areaDropSpeed);
          const isUp = tune.areaFall === 'up';
          spawn(
            {
              x: rect.x + Math.random() * rect.width,
              y: isUp ? rect.y + rect.height : rect.y,
            },
            Math.random() < 0.5 ? body : edge,
            tune.areaDropScale,
            rect.height / speed,
            (Math.random() - 0.5) * AREA_RAIN_SWAY,
            isUp ? -speed : speed,
          );
          continue;
        }
        const origin =
          tune.areaStyle === 'swirl'
            ? swirlPoint(
                rect,
                Math.floor(
                  Math.random() * Math.max(1, Math.round(tune.areaArms)),
                ),
                Math.random(),
                1,
                (elapsed / 1000) * tune.areaSpin * Math.PI * 2,
                tune,
              )
            : {
                x: rect.x + Math.random() * rect.width,
                y: rect.y + Math.random() * rect.height,
              };
        spawn(
          origin,
          edge,
          AREA_EMBER_SCALE,
          AREA_EMBER_LIFE_MS,
          (Math.random() - 0.5) * AREA_EMBER_DRIFT,
          (Math.random() - 0.5) * AREA_EMBER_DRIFT,
        );
      }
      if (age < 1) return true;
      graphics.destroy();
      softener?.destroy();
      return false;
    });
    wake();
  };

  const destroy = (): void => {
    app.destroy(true, { children: true, texture: true });
  };

  const setSpeed = (speed: number): void => {
    playbackSpeed = speed;
  };

  return { area, burst, destroy, setSpeed, spot, strike, travel };
};

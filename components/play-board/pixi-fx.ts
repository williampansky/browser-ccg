import {
  Application,
  BLEND_MODES,
  Graphics,
  LINE_CAP,
  LINE_JOIN,
  Sprite,
  Texture,
} from 'pixi.js';

import type { FlashTone } from './motion';

/** A point in screen pixels. */
export interface FxPoint {
  x: number;
  y: number;
}

/**
 * The effects layer: one transparent canvas over the whole page, drawing
 * particles. Everything here is cosmetic; the DOM versions in `motion.ts` are
 * the fallback while this is not loaded.
 */
export interface PixiFx {
  /** An orb with a particle trail flying `from` to `to` in `ms`. */
  projectile: (from: FxPoint, to: FxPoint, ms: number) => void;
  /** A bolt from the top of the screen striking `to` after `ms`. */
  lightning: (to: FxPoint, ms: number) => void;
  /** A ring of sparks at `at`, coloured by `tone`. */
  burst: (at: FxPoint, tone: FlashTone) => void;
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
const ORB_HALO_SCALE = 1.25;
const ORB_CORE_SCALE = 0.5;
const ORB_HALO_COLOUR = 0xffb347;
const ORB_PULSE = 0.18;
const ORB_PULSE_RATE = 0.035;
const TRAIL_PER_FRAME = 3;
const TRAIL_LIFE_MS = 260;
const TRAIL_SCALE = 0.4;
const TRAIL_DRIFT = 0.03;
const TRAIL_SPREAD = 3;
const TRAIL_COLOUR = 0xff8a2a;
const ARC_FRACTION = 0.07;
const EASE_POWER = 1.8;
const BURST_COUNT = 18;
const BURST_LIFE_MS = 420;
const BURST_SPEED_MIN = 0.12;
const BURST_SPEED_RANGE = 0.18;
const BURST_SCALE = 0.55;
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

const LIGHTNING_COLOUR = 0x8fb8ff;
const LIGHTNING_CORE = 0xffffff;
const LIGHTNING_SEGMENTS = 14;
const LIGHTNING_JITTER = 34;
const LIGHTNING_SWAY = 120;
const LIGHTNING_OVERSHOOT = 30;
const LIGHTNING_LIFE_MS = 300;
const LIGHTNING_REROLL_MS = 90;
const LIGHTNING_DROPOUT = 0.3;
const LIGHTNING_GLOW_SCALE = 3;
const BRANCH_COUNT = 3;
const BRANCH_SEGMENTS = 5;
const BRANCH_WIDTH = 0.45;
const BRANCH_REACH = 150;
const SCREEN_FLASH_ALPHA = 0.28;
const SCREEN_FLASH_MS = 140;
const BOLT_LAYERS: { alpha: number; colour: number; width: number }[] = [
  { alpha: 0.18, colour: LIGHTNING_COLOUR, width: 26 },
  { alpha: 0.45, colour: LIGHTNING_COLOUR, width: 11 },
  { alpha: 1, colour: LIGHTNING_CORE, width: 4 },
];

/**
 * A jagged line from `from` to `to`. The sideways kick shrinks toward the end
 * so the bolt lands exactly on its target.
 */
const jaggedPath = (
  from: FxPoint,
  to: FxPoint,
  segments: number = LIGHTNING_SEGMENTS,
  jitter: number = LIGHTNING_JITTER,
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
const makeBranches = (path: FxPoint[]): FxPoint[][] => {
  const branches: FxPoint[][] = [];
  for (let index = 0; index < BRANCH_COUNT; index++) {
    const fork = path[2 + Math.floor(Math.random() * (path.length - 5))];
    const side = Math.random() < 0.5 ? -1 : 1;
    const end = {
      x: fork.x + side * (BRANCH_REACH * (0.4 + Math.random() * 0.6)),
      y: fork.y + BRANCH_REACH * (0.3 + Math.random() * 0.6),
    };
    branches.push(jaggedPath(fork, end, BRANCH_SEGMENTS, LIGHTNING_JITTER / 2));
  }
  return branches;
};

/** Strokes a path in glow layers, widest and faintest first. */
const drawBolt = (
  graphics: Graphics,
  path: FxPoint[],
  widthScale: number,
  alpha: number,
): void => {
  for (const layer of BOLT_LAYERS) {
    graphics.lineStyle({
      alpha: layer.alpha * alpha,
      cap: LINE_CAP.ROUND,
      color: layer.colour,
      join: LINE_JOIN.ROUND,
      width: layer.width * widthScale,
    });
    graphics.moveTo(path[0].x, path[0].y);
    for (const point of path.slice(1)) graphics.lineTo(point.x, point.y);
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
  const particles: Particle[] = [];
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
    const deltaMs = app.ticker.deltaMS;
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

  const burst = (at: FxPoint, tone: FlashTone, override?: number): void => {
    const colour = override ?? TONE_COLOUR[tone];
    for (let spark = 0; spark < BURST_COUNT; spark++) {
      const angle = (spark / BURST_COUNT) * Math.PI * 2 + Math.random();
      const speed = BURST_SPEED_MIN + Math.random() * BURST_SPEED_RANGE;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      spawn(at, colour, BURST_SCALE, BURST_LIFE_MS, vx, vy);
    }
    wake();
  };

  const projectile = (from: FxPoint, to: FxPoint, ms: number): void => {
    const halo = new Sprite(texture);
    const core = new Sprite(texture);
    halo.tint = ORB_HALO_COLOUR;
    core.tint = 0xffffff;
    for (const part of [halo, core]) {
      part.anchor.set(0.5);
      part.blendMode = BLEND_MODES.ADD;
      addToStage(part);
    }
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    // A gentle sideways arc, so a shot is not a ruler line.
    const arcX = (-dy / distance) * distance * ARC_FRACTION;
    const arcY = (dx / distance) * distance * ARC_FRACTION;
    let elapsed = 0;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      const linear = Math.min(1, elapsed / ms);
      const eased = Math.pow(linear, EASE_POWER);
      const bend = Math.sin(Math.PI * eased);
      const at = {
        x: from.x + dx * eased + arcX * bend,
        y: from.y + dy * eased + arcY * bend,
      };
      const pulse = 1 + ORB_PULSE * Math.sin(elapsed * ORB_PULSE_RATE);
      halo.position.set(at.x, at.y);
      core.position.set(at.x, at.y);
      halo.scale.set(ORB_HALO_SCALE * pulse);
      core.scale.set(ORB_CORE_SCALE * pulse);
      for (let puff = 0; puff < TRAIL_PER_FRAME; puff++) {
        const jitter = () => (Math.random() - 0.5) * TRAIL_SPREAD;
        const drift = () => (Math.random() - 0.5) * TRAIL_DRIFT;
        const origin = { x: at.x + jitter(), y: at.y + jitter() };
        spawn(
          origin,
          TRAIL_COLOUR,
          TRAIL_SCALE,
          TRAIL_LIFE_MS,
          drift(),
          drift(),
        );
      }
      if (linear < 1) return true;
      halo.destroy();
      core.destroy();
      burst(to, 'hit');
      return false;
    });
    wake();
  };

  const lightning = (to: FxPoint, ms: number): void => {
    const bolt = new Graphics();
    bolt.blendMode = BLEND_MODES.ADD;
    app.stage.addChild(bolt as never);
    const glow = new Sprite(texture);
    glow.anchor.set(0.5);
    glow.tint = LIGHTNING_COLOUR;
    glow.blendMode = BLEND_MODES.ADD;
    glow.position.set(to.x, to.y);
    addToStage(glow);
    const startX = to.x + (Math.random() - 0.5) * LIGHTNING_SWAY;
    let path = jaggedPath({ x: startX, y: -LIGHTNING_OVERSHOOT }, to);
    let branches = makeBranches(path);
    let elapsed = 0;
    let isStruck = false;
    let reroll = 0;
    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      // Before the strike a blue glow gathers where it will land.
      if (elapsed < ms) {
        glow.scale.set(LIGHTNING_GLOW_SCALE * (elapsed / ms));
        glow.alpha = elapsed / ms;
        return true;
      }
      if (!isStruck) {
        isStruck = true;
        burst(to, 'hit', LIGHTNING_COLOUR);
        flashScreen();
      }
      const since = elapsed - ms;
      const life = 1 - since / LIGHTNING_LIFE_MS;
      if (life <= 0) {
        bolt.destroy();
        glow.destroy();
        return false;
      }
      // The bolt re-forms a few times, like a real flicker.
      if (since > reroll) {
        reroll += LIGHTNING_REROLL_MS;
        path = jaggedPath({ x: startX, y: -LIGHTNING_OVERSHOOT }, to);
        branches = makeBranches(path);
      }
      const flicker = Math.random() < LIGHTNING_DROPOUT ? 0.35 : 1;
      const alpha = life * flicker;
      glow.scale.set(LIGHTNING_GLOW_SCALE * (1 + (1 - life)));
      glow.alpha = alpha;
      bolt.clear();
      drawBolt(bolt, path, 1, alpha);
      for (const branch of branches)
        drawBolt(bolt, branch, BRANCH_WIDTH, alpha);
      return true;
    });
    wake();
  };

  /** A sheet of white across the whole screen that fades in a blink. */
  const flashScreen = (): void => {
    const sheet = new Graphics();
    sheet.beginFill(0xcfe0ff, 1);
    sheet.drawRect(0, 0, window.innerWidth, window.innerHeight);
    sheet.endFill();
    sheet.blendMode = BLEND_MODES.ADD;
    sheet.alpha = SCREEN_FLASH_ALPHA;
    app.stage.addChild(sheet as never);
    let age = 0;
    jobs.add((deltaMs) => {
      age += deltaMs;
      sheet.alpha = SCREEN_FLASH_ALPHA * (1 - age / SCREEN_FLASH_MS);
      if (age < SCREEN_FLASH_MS) return true;
      sheet.destroy();
      return false;
    });
  };

  const destroy = (): void => {
    app.destroy(true, { children: true, texture: true });
  };

  return { burst, destroy, lightning, projectile };
};

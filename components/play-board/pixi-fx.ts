import { Application, BLEND_MODES, Sprite, Texture, Graphics } from 'pixi.js';

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
const ORB_SCALE = 1.1;
const ORB_PULSE = 0.25;
const ORB_PULSE_RATE = 0.03;
const TRAIL_PER_FRAME = 2;
const TRAIL_LIFE_MS = 320;
const TRAIL_SCALE = 0.5;
const TRAIL_DRIFT = 0.04;
const TRAIL_SPREAD = 6;
const ARC_FRACTION = 0.08;
const EASE_POWER = 1.6;
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

  const burst = (at: FxPoint, tone: FlashTone): void => {
    const colour = TONE_COLOUR[tone];
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
    const colour = TONE_COLOUR.hit;
    const head = new Sprite(texture);
    head.anchor.set(0.5);
    head.tint = colour;
    head.blendMode = BLEND_MODES.ADD;
    addToStage(head);
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
      head.position.set(at.x, at.y);
      head.scale.set(
        ORB_SCALE * (1 + ORB_PULSE * Math.sin(elapsed * ORB_PULSE_RATE)),
      );
      for (let puff = 0; puff < TRAIL_PER_FRAME; puff++) {
        const jitter = () => (Math.random() - 0.5) * TRAIL_SPREAD;
        const drift = () => (Math.random() - 0.5) * TRAIL_DRIFT;
        const origin = { x: at.x + jitter(), y: at.y + jitter() };
        spawn(origin, colour, TRAIL_SCALE, TRAIL_LIFE_MS, drift(), drift());
      }
      if (linear < 1) return true;
      head.destroy();
      burst(to, 'hit');
      return false;
    });
    wake();
  };

  const destroy = (): void => {
    app.destroy(true, { children: true, texture: true });
  };

  return { burst, destroy, projectile };
};

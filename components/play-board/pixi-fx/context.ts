import { Application, BLEND_MODES, Graphics, Sprite, Texture } from 'pixi.js';

import type { FlashTone } from '../motion';
import { SPELL_FX_SPRITES, spriteUrl } from '../spell-fx-sprites';
import { SPELL_FX_DEFAULTS } from '../spell-fx-tune';
import type { SpellFxTune } from '../spell-fx-tune';

import type { FxContext, FxPoint, Particle } from './types';

const TONE_COLOUR: Record<FlashTone, number> = {
  hit: 0xffd27a,
  heal: 0x4dff7a,
  buff: 0xffd23f,
};

const SOFT_TEXTURE_SIZE = 32;
const SOFT_RINGS = 8;
const GLOW_ALPHA = 0.12;
const BURST_SPEED_MIN = 0.12;
const BURST_SPEED_RANGE = 0.18;
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

const SCREEN_FLASH_MS = 140;

/** Creates the overlay canvas and the helpers every effect base shares. */
export const createFxContext = (): FxContext => {
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

  const destroy = (): void => {
    app.destroy(true, { children: true, texture: true });
  };

  const setSpeed = (speed: number): void => {
    playbackSpeed = speed;
  };

  return {
    addToStage,
    app,
    burst,
    burstWith,
    destroy,
    flashScreen,
    jobs,
    particles,
    setSpeed,
    spawn,
    texture,
    wake,
  };
};

import { BLEND_MODES, Graphics, Sprite } from 'pixi.js';

import { colourNumber } from '../spell-fx-tune';
import type { SpellFxTune } from '../spell-fx-tune';

import type { FxContext, FxPoint } from './types';

/** The white core of a bloom, as a fraction of the bloom's size. */
const FLASH_CORE_SIZE = 0.45;

/** A bloom starts at this fraction of its full size and grows to it. */
const FLASH_START_SIZE = 0.3;

/** A ring never draws thinner than this (px), so it fades out, not away. */
const RING_MIN_WIDTH = 1;

/** Lingering sparkles start within this many px of the hit. */
const LINGER_SPREAD = 28;

/** Lingering sparkles drift up this fast (px per ms), at least and at most. */
const LINGER_RISE_MIN = 0.02;
const LINGER_RISE_RANGE = 0.03;

/** Lingering sparkles start over the first part of the time, then fade. */
const LINGER_START_SHARE = 0.5;
const LINGER_LIFE_MIN = 0.6;
const LINGER_SCALE = 0.3;

const easeOut = (age: number): number => 1 - Math.pow(1 - age, 3);

/** A bloom's size (px scale) and opacity at `age` (0 to 1). */
export const flashState = (
  age: number,
  tune: SpellFxTune,
): { alpha: number; scale: number } => {
  const grow = FLASH_START_SIZE + (1 - FLASH_START_SIZE) * easeOut(age);

  return { alpha: 1 - age, scale: tune.finishFlash * grow };
};

/** A ring's reach, opacity and line width at `age` (0 to 1). */
export const ringState = (
  age: number,
  tune: SpellFxTune,
): { alpha: number; radius: number; width: number } => {
  return {
    alpha: 1 - age,
    radius: tune.finishRing * easeOut(age),
    width: Math.max(RING_MIN_WIDTH, tune.finishRingWidth * (1 - age)),
  };
};

/** Whether a tune asks for any finisher at all. */
export const hasFinisher = (tune: SpellFxTune): boolean => {
  return tune.finishFlash > 0 || tune.finishRing > 0 || tune.finishLinger > 0;
};

/** Builds the finisher: what plays on top of the impact sparks. */
export const createFinisher = (
  context: Pick<
    FxContext,
    'addToStage' | 'app' | 'jobs' | 'spawn' | 'texture' | 'wake'
  >,
): ((at: FxPoint, tune: SpellFxTune) => void) => {
  const { addToStage, app, jobs, spawn, texture, wake } = context;

  const additive = (at: FxPoint, tint: number): Sprite => {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.tint = tint;
    sprite.blendMode = BLEND_MODES.ADD;
    sprite.position.set(at.x, at.y);
    addToStage(sprite);

    return sprite;
  };

  const playFlash = (at: FxPoint, tune: SpellFxTune): void => {
    const colour = colourNumber(tune.finishColour);
    const bloom = additive(at, colour);
    const core = additive(at, 0xffffff);
    let elapsed = 0;

    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      const age = Math.min(1, elapsed / tune.finishFlashMs);
      const { alpha, scale } = flashState(age, tune);
      bloom.scale.set(scale);
      core.scale.set(scale * FLASH_CORE_SIZE);
      bloom.alpha = alpha;
      core.alpha = alpha;
      if (age < 1) return true;
      bloom.destroy();
      core.destroy();

      return false;
    });
  };

  const playRing = (at: FxPoint, tune: SpellFxTune): void => {
    const colour = colourNumber(tune.finishColour);
    const ring = new Graphics();
    ring.blendMode = BLEND_MODES.ADD;
    app.stage.addChild(ring as never);
    let elapsed = 0;

    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      const age = Math.min(1, elapsed / tune.finishRingMs);
      const { alpha, radius, width } = ringState(age, tune);
      ring.clear();
      if (age >= 1) {
        ring.destroy();

        return false;
      }
      ring.lineStyle({ alpha, color: colour, width });
      ring.drawEllipse(at.x, at.y, radius, radius * tune.finishRingSquash);

      return true;
    });
  };

  const playLinger = (at: FxPoint, tune: SpellFxTune): void => {
    const colour = colourNumber(tune.finishColour);
    const count = Math.round(tune.finishLinger);
    const startSpan = tune.finishLingerMs * LINGER_START_SHARE;
    const delays = Array.from({ length: count }, () => {
      return Math.random() * startSpan;
    }).sort((first, second) => first - second);
    let next = 0;
    let elapsed = 0;

    jobs.add((deltaMs) => {
      elapsed += deltaMs;
      while (next < count && delays[next] <= elapsed) {
        const angle = Math.random() * Math.PI * 2;
        const reach = LINGER_SPREAD * Math.sqrt(Math.random());
        const start = {
          x: at.x + Math.cos(angle) * reach,
          y: at.y + Math.sin(angle) * reach,
        };
        const life =
          tune.finishLingerMs *
          (LINGER_LIFE_MIN + (1 - LINGER_LIFE_MIN) * Math.random());
        const rise = LINGER_RISE_MIN + Math.random() * LINGER_RISE_RANGE;
        spawn(start, colour, LINGER_SCALE, life, 0, -rise);
        next++;
      }

      return next < count;
    });
  };

  return (at, tune) => {
    if (tune.finishFlash > 0) playFlash(at, tune);
    if (tune.finishRing > 0) playRing(at, tune);
    if (tune.finishLinger > 0) playLinger(at, tune);
    wake();
  };
};

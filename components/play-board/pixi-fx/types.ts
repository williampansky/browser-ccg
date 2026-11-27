import { Application, Sprite, Texture } from 'pixi.js';

import type { FlashTone } from '../motion';
import type { SpellFxTune } from '../spell-fx-tune';

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

export interface Particle {
  age: number;
  life: number;
  scale: number;
  sprite: Sprite;
  vx: number;
  vy: number;
}

/**
 * What every effect base shares: the overlay stage, the particle pool and the
 * helpers that put things on it. Built once by `createFxContext`.
 */
export interface FxContext {
  addToStage: (sprite: Sprite) => void;
  app: Application;
  burst: PixiFx['burst'];
  burstWith: (
    at: FxPoint,
    tone: FlashTone,
    tune: SpellFxTune,
    override?: number,
  ) => void;
  destroy: () => void;
  flashScreen: (strength: number, colour?: number) => void;
  jobs: Set<(deltaMs: number) => boolean>;
  particles: Particle[];
  setSpeed: (speed: number) => void;
  spawn: (
    at: FxPoint,
    colour: number,
    scale: number,
    life: number,
    vx: number,
    vy: number,
  ) => void;
  texture: Texture;
  wake: () => void;
}

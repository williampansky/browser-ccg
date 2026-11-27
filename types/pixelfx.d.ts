/**
 * Types for the parts of pixelfx (https://github.com/patch-gg/pixelfx, MIT)
 * this repo uses. The package ships plain JavaScript with no types.
 */
declare module 'pixelfx' {
  /** What an effect module says about itself. */
  export interface PixelEffectMeta {
    /** Seconds the effect lasts (a loop repeats). */
    duration: number;
    fps?: number;
    loop?: boolean;
    name: string;
    /** Where the effect's anchor sits inside its frame, in frame pixels. */
    origin: [number, number];
    /** The frame's width and height in pixels. */
    size: [number, number];
  }

  export interface PixelEffectModule {
    meta: PixelEffectMeta;
    [key: string]: unknown;
  }

  /** The caller's options; an effect adds its own on top. */
  export interface PixelFxOptions {
    angle?: number;
    flip?: boolean;
    light?: number;
    palette?: string[];
    seed?: number;
    x?: number;
    y?: number;
  }

  export interface PixelFrame {
    color: Uint32Array;
    h: number;
    light: Uint32Array;
    w: number;
  }

  export interface PixelFx {
    done: () => boolean;
    draw: (frame: PixelFrame, layer?: 'back' | 'front') => void;
    stop: () => void;
    update: (seconds: number) => void;
  }

  export function createFrame(width: number, height: number): PixelFrame;
  export function clearFrame(frame: PixelFrame): PixelFrame;
  export function createFx(
    effect: PixelEffectModule,
    options?: PixelFxOptions,
  ): PixelFx;
  export function composite(
    frame: PixelFrame,
    out: Uint8ClampedArray,
    background?: number | null,
    lightStrength?: number,
  ): void;
}

declare module 'pixelfx/fx/*' {
  import type { PixelEffectModule } from 'pixelfx';

  const effect: PixelEffectModule;
  export = effect;
}

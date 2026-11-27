import { clearFrame, composite, createFrame, createFx } from 'pixelfx';
import type { PixelEffectModule, PixelFxOptions } from 'pixelfx';

export type PixelEffectLoader = () => Promise<PixelEffectModule>;

/**
 * The pixelfx effects the game can play, loaded on demand so the bundle only
 * carries the ones that are used. The key is the effect's path in pixelfx
 * (`<category>/<name>`). Add an entry here to make another one playable.
 */
export const PIXEL_EFFECTS: Record<string, PixelEffectLoader> = {
  'explosions/big-explosion': () => {
    return import('pixelfx/fx/explosions/big-explosion');
  },
  'holy/heal': () => import('pixelfx/fx/holy/heal'),
  'ice/frost-nova': () => import('pixelfx/fx/ice/frost-nova'),
};

/** One running pixelfx effect, drawn into an RGBA pixel buffer. */
export interface PixelPlayer {
  height: number;
  /** True once a one-shot effect has played out. */
  isDone: () => boolean;
  /** The RGBA bytes of the latest frame (the same array every step). */
  pixels: Uint8ClampedArray;
  /** Advances the effect and redraws `pixels`. */
  step: (seconds: number) => Uint8ClampedArray;
  width: number;
}

/**
 * Wraps a pixelfx effect so the caller only advances time and reads pixels,
 * with no Pixi in it (so it can be tested). The effect is centred on its own
 * anchor (`meta.origin`); `options` can flip, rotate, recolour (`palette`) or
 * seed it.
 */
export const createPixelPlayer = (
  effect: PixelEffectModule,
  options: PixelFxOptions = {},
): PixelPlayer => {
  const { origin, size } = effect.meta;
  const [width, height] = size;
  const [originX, originY] = origin;
  const frame = createFrame(width, height);
  const pixels = new Uint8ClampedArray(width * height * 4);
  const instance = createFx(effect, { x: originX, y: originY, ...options });

  const step = (seconds: number): Uint8ClampedArray => {
    instance.update(seconds);
    clearFrame(frame);
    instance.draw(frame);
    composite(frame, pixels, null);

    return pixels;
  };

  return { height, isDone: () => instance.done(), pixels, step, width };
};

import { createPixelPlayer, PIXEL_EFFECTS } from '../pixel-fx';

const FRAME_SECONDS = 1 / 30;
const FRAMES_TO_PLAY = 12;
const ALPHA_OFFSET = 3;
const RGBA_STRIDE = 4;

const visiblePixels = (pixels: Uint8ClampedArray): number => {
  let visible = 0;

  for (let i = ALPHA_OFFSET; i < pixels.length; i += RGBA_STRIDE) {
    if (pixels[i] > 0) visible++;
  }

  return visible;
};

describe('pixelfx adapter', () => {
  it.each(Object.keys(PIXEL_EFFECTS))('%s draws pixels', async (id) => {
    const effect = await PIXEL_EFFECTS[id]();
    const player = createPixelPlayer(effect);
    let latest = player.pixels;

    for (let frame = 0; frame < FRAMES_TO_PLAY; frame++) {
      latest = player.step(FRAME_SECONDS);
    }

    const [width, height] = effect.meta.size;

    expect(player.width).toBe(width);
    expect(player.height).toBe(height);
    expect(latest.length).toBe(width * height * RGBA_STRIDE);
    expect(visiblePixels(latest)).toBeGreaterThan(0);
  });

  it('finishes a one-shot effect once its duration has passed', async () => {
    const effect = await PIXEL_EFFECTS['holy/heal']();
    const player = createPixelPlayer(effect);

    expect(player.isDone()).toBe(false);
    player.step(effect.meta.duration + 1);

    expect(player.isDone()).toBe(true);
  });
});

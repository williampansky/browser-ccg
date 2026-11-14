import React, { useEffect, useRef } from 'react';
import { animatedIconOf, FRAME_RATE, frameUrl } from './animated-icons';

/**
 * Frames are decoded once into images and painted on a <canvas>, tinted with the element's text colour. Swapping a CSS mask-image per frame
 * flashed (the browser can show nothing while it decodes the next URL, and every frame re-rendered React), so nothing here touches React
 * state while playing: a frame is one synchronous draw. Sequences differ in canvas size and padding (Parallel Dots is 177 x 49, one plus sign is a
 * small shape in a 500 px frame), so each icon is sized by its resting shape (the last frame; all frames for the dot spinners) and fitted into a square.
 */
const SIZE = 96; // the frames' own size

interface Loaded {
  frames: HTMLImageElement[];
  /** The box (in each frame's own pixels) that sizes the icon: the shape at rest (last frame), or every frame for a spinner. */
  box: { x: number; y: number; w: number; h: number };
  /** Share of the square the box fills (a resting shape leaves room for the overshoot and spin of the animation). */
  fill: number;
}
const decoded = new Map<string, Promise<Loaded>>();

/** The smallest rectangle that covers the visible pixels of the given frames. */
const unionBox = (frames: HTMLImageElement[]): Loaded['box'] => {
  const w = frames[0].naturalWidth;
  const h = frames[0].naturalHeight;
  const probe = document.createElement('canvas');
  probe.width = w;
  probe.height = h;
  const ctx = probe.getContext('2d', { willReadFrequently: true });
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  if (ctx) {
    for (const img of frames) {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, w, h).data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (d[(y * w + x) * 4 + 3] > 12) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
    }
  }
  return x1 < 0 ? { x: 0, y: 0, w, h } : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
};

/** Fetches and decodes every frame of an icon once, and works out where the shape sits. */
export const preloadIcon = (id: string): Promise<Loaded> => {
  const def = animatedIconOf(id);
  if (!def || typeof Image === 'undefined') return Promise.resolve({ frames: [], box: { x: 0, y: 0, w: 1, h: 1 }, fill: 1 });
  let p = decoded.get(id);
  if (!p) {
    p = Promise.all(
      Array.from({ length: def.frames }, (_, i) => {
        const img = new Image();
        img.src = frameUrl(id, i);
        return (img.decode ? img.decode().catch(() => undefined) : new Promise((r) => (img.onload = img.onerror = () => r(undefined)))).then(() => img);
      })
    ).then((frames) => ({ frames, box: unionBox(def.spinner ? frames : frames.slice(-1)), fill: def.spinner ? 1 : 0.74 }));
    decoded.set(id, p);
  }
  return p;
};

type Props = {
  /** An id from `ANIMATED_ICONS`. */
  name: string;
  /** Size in px (it is square). 0 lets CSS (`style`) size it. */
  size?: number;
  /**
   * `on`: plays forward when this turns true and back when it turns false; rests on the last frame while true and shows nothing while false.
   * Leave undefined to show one fixed frame (see `rest`).
   */
  on?: boolean;
  /**
   * With `on`: nothing is drawn while off (a fast fade-out instead of playing back), and turning on plays from the first frame. For things that
   * come and go, like a checkbox tick, where the first frame must not show.
   */
  hideWhenOff?: boolean;
  /** With no `on`: the frame shown, 0 to 1 (default the last). */
  rest?: number;
  /** Plays forever (a spinner). */
  loop?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/** An animated icon in the current text colour. Honors `prefers-reduced-motion` (no animation, just the resting frame). */
export const AnimatedIcon = ({ name, size = 20, on, hideWhenOff, rest = 1, loop, className, style }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null); // the frame on screen (null: nothing drawn yet)
  const imgs = useRef<HTMLImageElement[]>([]);
  const box = useRef<Loaded['box']>({ x: 0, y: 0, w: 1, h: 1 });
  const fill = useRef(1);
  const mounted = useRef(false);
  const def = animatedIconOf(name);
  const last = (def?.frames ?? 1) - 1;

  const draw = (f: number) => {
    const c = ref.current;
    const img = imgs.current[f];
    const ctx = c?.getContext('2d');
    if (!c || !ctx || !img) return;
    frameRef.current = f;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, SIZE, SIZE);
    // The sizing box is the same for every frame, so nothing jumps; it is centred and fitted (never stretched) to a share of the square. Parts of
    // a frame that fall outside it (overshoot, a spin) still draw, up to the edge of the canvas.
    const b = box.current;
    const k = (Math.min(SIZE / b.w, SIZE / b.h) * fill.current * 0.98) || 1;
    ctx.drawImage(img, SIZE / 2 - (b.x + b.w / 2) * k, SIZE / 2 - (b.y + b.h / 2) * k, img.naturalWidth * k, img.naturalHeight * k);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = getComputedStyle(c).color;
    ctx.fillRect(0, 0, SIZE, SIZE);
  };

  /** Nothing drawn: the "off" end of an icon (the first frames of most icons are stray marks, not a blank). */
  const clear = () => {
    ref.current?.getContext('2d')?.clearRect(0, 0, SIZE, SIZE);
    frameRef.current = 0;
  };

  // Redraw in the new colour when the interface theme changes under a resting icon.
  useEffect(() => {
    const mo = new MutationObserver(() => frameRef.current !== null && draw(frameRef.current));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ui-theme'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (!def) return;
    const c = ref.current;
    const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const first = !mounted.current;
    mounted.current = true;
    let raf = 0;
    let cancelled = false;
    const fade = (visible: boolean) => {
      if (c) c.style.opacity = visible ? '1' : '0';
    };

    void preloadIcon(name).then(({ frames, box: b, fill: f }) => {
      if (cancelled || !frames.length) return;
      imgs.current = frames;
      box.current = b;
      fill.current = f;
      const play = (from: number, to: number) => {
        let t0 = 0;
        const dir = to >= from ? 1 : -1;
        const step = (now: number) => {
          if (!t0) t0 = now;
          const k = Math.floor(((now - t0) / 1000) * FRAME_RATE);
          const f = from + dir * k;
          const done = dir === 1 ? f >= to : f <= to;
          if (done && to === 0 && on === false) clear();
          else draw(done ? to : f);
          if (!done) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      };

      if (loop) {
        let t0 = 0;
        const spin = (now: number) => {
          if (!t0) t0 = now;
          draw(Math.floor(((now - t0) / 1000) * FRAME_RATE) % (last + 1));
          raf = requestAnimationFrame(spin);
        };
        if (reduced) draw(Math.round(rest * last));
        else raf = requestAnimationFrame(spin);
        return;
      }
      if (on === undefined) return draw(Math.round(rest * last));
      if (hideWhenOff) {
        if (!on) return fade(false); // keep whatever is drawn, fade it away
        // On the first render a checked box just shows its tick; later it is drawn in, from a cleared first frame (not the old finished tick).
        if (first || reduced) {
          draw(last);
          return fade(true);
        }
        draw(0);
        fade(true);
        return play(0, last);
      }
      const target = on ? last : 0;
      const from = frameRef.current ?? target;
      if (first || reduced) return target === 0 ? clear() : draw(target);
      play(from, target);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [name, on, hideWhenOff, loop, rest, def, last]);

  if (!def) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      width={SIZE}
      height={SIZE}
      className={className}
      style={{
        display: 'block',
        flex: 'none',
        width: size || undefined,
        height: size || undefined,
        opacity: hideWhenOff && !on ? 0 : 1,
        transition: hideWhenOff ? 'opacity 0.1s' : undefined,
        ...style,
      }}
    />
  );
};

import React, { useEffect, useRef } from 'react';
import { animatedIconOf, FRAME_RATE, frameUrl } from './animated-icons';

/**
 * Frames are decoded once into images and painted on a <canvas>, tinted with the element's text colour. Swapping a CSS mask-image per frame
 * flashed (the browser can show nothing while it decodes the next URL, and every frame re-rendered React), so nothing here touches React
 * state while playing: a frame is one synchronous draw.
 */
const SIZE = 96; // the frames' own size

const decoded = new Map<string, Promise<HTMLImageElement[]>>();

/** Fetches and decodes every frame of an icon once. */
export const preloadIcon = (id: string): Promise<HTMLImageElement[]> => {
  const def = animatedIconOf(id);
  if (!def || typeof Image === 'undefined') return Promise.resolve([]);
  let p = decoded.get(id);
  if (!p) {
    p = Promise.all(
      Array.from({ length: def.frames }, (_, i) => {
        const img = new Image();
        img.src = frameUrl(id, i);
        return (img.decode ? img.decode().catch(() => undefined) : new Promise((r) => (img.onload = img.onerror = () => r(undefined)))).then(() => img);
      })
    );
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
   * `on`: plays forward when this turns true and back when it turns false; rests on the last frame while true, the first while false.
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
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = getComputedStyle(c).color;
    ctx.fillRect(0, 0, SIZE, SIZE);
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

    void preloadIcon(name).then((frames) => {
      if (cancelled || !frames.length) return;
      imgs.current = frames;
      const play = (from: number, to: number) => {
        let t0 = 0;
        const dir = to >= from ? 1 : -1;
        const step = (now: number) => {
          if (!t0) t0 = now;
          const k = Math.floor(((now - t0) / 1000) * FRAME_RATE);
          const f = from + dir * k;
          const done = dir === 1 ? f >= to : f <= to;
          draw(done ? to : f);
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
      if (first || reduced) return draw(target);
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

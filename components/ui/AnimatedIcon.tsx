import React, { useEffect, useRef, useState } from 'react';
import { animatedIconOf, FRAME_RATE, frameUrl } from './animated-icons';

const loaded = new Set<string>();

/** Fetches every frame of an icon once, so the first play does not stutter. Resolves when they are all in (or failed). */
export const preloadIcon = (id: string): Promise<void> => {
  const def = animatedIconOf(id);
  if (!def || loaded.has(id) || typeof Image === 'undefined') return Promise.resolve();
  loaded.add(id);
  return Promise.all(
    Array.from({ length: def.frames }, (_, i) => new Promise<void>((res) => {
      const img = new Image();
      img.onload = img.onerror = () => res();
      img.src = frameUrl(id, i);
    }))
  ).then(() => undefined);
};

type Props = {
  /** An id from `ANIMATED_ICONS`. */
  name: string;
  /** Size in px (it is square). */
  size?: number;
  /**
   * `on`: the icon plays forward when this turns true and backward when it turns false, and rests on its last frame while true and its
   * first while false. Leave it undefined to show one fixed frame (see `rest`).
   */
  on?: boolean;
  /** With no `on`: the frame shown, 0 to 1 (default the last). */
  rest?: number;
  /** Plays forever (a spinner). */
  loop?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/** An animated icon in the current text colour. Honors `prefers-reduced-motion` (no animation, just the resting frame). */
export const AnimatedIcon = ({ name, size = 20, on, rest = 1, loop, className, style }: Props) => {
  const def = animatedIconOf(name);
  const last = (def?.frames ?? 1) - 1;
  const target = on === undefined ? Math.round(rest * last) : on ? last : 0;
  const [frame, setFrame] = useState(target);
  const frameRef = useRef(frame);
  frameRef.current = frame;

  useEffect(() => {
    if (!def) return;
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced && !loop) return setFrame(target);
    let raf = 0;
    let cancelled = false;
    let t0 = 0;
    let from = frameRef.current;
    void preloadIcon(name).then(() => {
      if (cancelled) return;
      const step = (now: number) => {
        if (!t0) t0 = now;
        const elapsed = ((now - t0) / 1000) * FRAME_RATE;
        if (loop) {
          setFrame(Math.floor(elapsed) % (last + 1));
          raf = requestAnimationFrame(step);
          return;
        }
        const dir = target >= from ? 1 : -1;
        const next = from + dir * Math.floor(elapsed);
        const done = dir === 1 ? next >= target : next <= target;
        setFrame(done ? target : next);
        if (!done) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [name, target, loop, def, last]);

  if (!def) return null;
  const url = `url(${frameUrl(name, Math.min(Math.max(frame, 0), last))})`;
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-block',
        flex: 'none',
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        ...style,
      }}
    />
  );
};

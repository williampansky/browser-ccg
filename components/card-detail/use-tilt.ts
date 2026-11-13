import { useRef } from 'react';
import type { MouseEvent, RefObject } from 'react';

/**
 * Pointer-following tilt. Spread the result onto an element whose CSS reads `--rx` / `--ry` (the tilt) and `--mx` / `--my`
 * (where the pointer is, for a sheen); the hook only sets those four variables, and removes them when the pointer leaves.
 */
export const useTilt = <T extends HTMLElement>(maxDegrees: number): { ref: RefObject<T>; onMouseMove: (e: MouseEvent) => void; onMouseLeave: () => void } => {
  const ref = useRef<T>(null);
  const onMouseMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((px - 0.5) * 2 * maxDegrees).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - py) * 2 * maxDegrees).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };
  const onMouseLeave = () => {
    const el = ref.current;
    if (el) for (const v of ['--rx', '--ry', '--mx', '--my']) el.style.removeProperty(v);
  };
  return { ref, onMouseMove, onMouseLeave };
};

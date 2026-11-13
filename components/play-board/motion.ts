/**
 * Motion that gives the board weight: things are thrown, land and hit rather than just changing state. Everything here is
 * skipped when the player asks the system for reduced motion.
 */
export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** When the strike of an attack lands, in ms after it starts; the target's shake and damage numbers wait for this. */
export const IMPACT_MS = 190;
const LUNGE_MS = 520;

export interface Point {
  x: number;
  y: number;
}

/**
 * The keyframes of an attack, as offsets from the attacker's place: pull back a little (the wind-up), strike most of the way to
 * the target and hit it at `IMPACT_MS`, then ease home. `to` is the vector from attacker to target centre.
 */
export const lungeFrames = (to: Point): Keyframe[] => {
  const len = Math.hypot(to.x, to.y) || 1;
  const back = { x: (-to.x / len) * 14, y: (-to.y / len) * 14 };
  const hit = { x: to.x * 0.82, y: to.y * 0.82 };
  const t = (p: Point, scale: number) => `translate(${p.x}px, ${p.y}px) scale(${scale})`;
  return [
    { transform: t({ x: 0, y: 0 }, 1), offset: 0, easing: 'ease-out' },
    { transform: t(back, 1.06), offset: 0.2, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' },
    { transform: t(hit, 1.14), offset: IMPACT_MS / LUNGE_MS, easing: 'ease-out' },
    { transform: t({ x: hit.x * 1.02, y: hit.y * 1.02 }, 1.14), offset: 0.42, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' },
    { transform: t({ x: 0, y: 0 }, 1), offset: 1 },
  ];
};

const centre = (el: HTMLElement): Point => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/** Throws `attacker` at `target` (both on screen) and back. Raises it above its neighbours for the duration. */
export const lunge = (attacker: HTMLElement, target: HTMLElement): void => {
  if (reducedMotion() || !attacker.animate) return;
  const a = centre(attacker);
  const t = centre(target);
  const prev = attacker.style.zIndex;
  attacker.style.zIndex = '60';
  const anim = attacker.animate(lungeFrames({ x: t.x - a.x, y: t.y - a.y }), { duration: LUNGE_MS });
  const done = () => {
    attacker.style.zIndex = prev;
  };
  anim.onfinish = done;
  anim.oncancel = done;
};

/** A short jolt of the whole table, for a big hit. */
export const nudge = (el: HTMLElement, strength: number): void => {
  if (reducedMotion() || !el.animate) return;
  const s = Math.min(8, 2 + strength);
  el.animate(
    [
      { transform: 'translate(0, 0)' },
      { transform: `translate(${-s}px, ${s * 0.6}px)`, offset: 0.2 },
      { transform: `translate(${s * 0.8}px, ${-s * 0.4}px)`, offset: 0.45 },
      { transform: `translate(${-s * 0.4}px, ${s * 0.2}px)`, offset: 0.7 },
      { transform: 'translate(0, 0)' },
    ],
    { duration: 260, delay: IMPACT_MS, easing: 'ease-out' }
  );
};

/** How long a played minion's card flies from the hand to its slot; the landing waits for it. */
export const FLIGHT_MS = 380;

/** The keyframes of a card flying from `from` to `to` (screen rects): it rises a little, then swoops in and shrinks to the minion. */
export const flightFrames = (from: DOMRect, to: DOMRect): Keyframe[] => {
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const s = Math.max(0.25, to.width / from.width);
  return [
    { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: 1, offset: 0, easing: 'ease-out' },
    { transform: `translate(${dx * 0.15}px, ${dy * 0.15 - 36}px) scale(1.08) rotate(-3deg)`, opacity: 1, offset: 0.3, easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)' },
    { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(0deg)`, opacity: 0.85, offset: 1 },
  ];
};

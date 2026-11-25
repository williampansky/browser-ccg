import { getHeroSwing } from './hero-swing-tune';
import type { HeroSwingSettings } from './hero-swing-tune';

/**
 * Motion that gives the board weight: things are thrown, land and hit rather
 * than just changing state. Everything here is
 * skipped when the player asks the system for reduced motion.
 */
export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * When the strike of an attack lands, in ms after it starts; the target's shake
 * and damage numbers wait for this.
 */
export const IMPACT_MS = 190;
/** When a hero's slam lands (see `heroSwingFrames`). */
export const heroImpactMs = (): number => getHeroSwing().impactMs;

let currentImpactMs = IMPACT_MS;

/**
 * The impact time of the attack in flight: the target's shake, damage numbers
 * and sounds wait this long. A hero's heavier swing lands later than a
 * minion's lunge. The CSS reads it as `--impact-ms`.
 */
export const getImpactMs = (): number => currentImpactMs;

export const setImpactMs = (ms: number): void => {
  currentImpactMs = ms;
  if (typeof document !== 'undefined')
    document.documentElement.style.setProperty('--impact-ms', `${ms}ms`);
};
const LUNGE_MS = 520;

export interface Point {
  x: number;
  y: number;
}

/**
 * The keyframes of an attack, as offsets from the attacker's place: pull back a
 * little (the wind-up), strike most of the way to
 * the target and hit it at `IMPACT_MS`, then ease home. `to` is the vector from
 * attacker to target centre.
 */
export const lungeFrames = (to: Point): Keyframe[] => {
  const len = Math.hypot(to.x, to.y) || 1;
  const back = { x: (-to.x / len) * 14, y: (-to.y / len) * 14 };
  const hit = { x: to.x * 0.82, y: to.y * 0.82 };
  const t = (p: Point, scale: number) =>
    `translate(${p.x}px, ${p.y}px) scale(${scale})`;
  return [
    { transform: t({ x: 0, y: 0 }, 1), offset: 0, easing: 'ease-out' },
    {
      transform: t(back, 1.06),
      offset: 0.2,
      easing: 'cubic-bezier(0.55, 0, 1, 0.45)',
    },
    {
      transform: t(hit, 1.14),
      offset: IMPACT_MS / LUNGE_MS,
      easing: 'ease-out',
    },
    {
      transform: t({ x: hit.x * 1.02, y: hit.y * 1.02 }, 1.14),
      offset: 0.42,
      easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
    },
    { transform: t({ x: 0, y: 0 }, 1), offset: 1 },
  ];
};

/** How far through the time after the hold the drift home and the settle are. */
const DRIFT_FRACTION = 0.56;
const SETTLE_FRACTION = 0.8;
const HOVER_OFFSET = 6;
const DRIFT_SCALE = 1.04;
const HOLD_WIDEN = 0.02;
const SETTLE_SQUASH_X = 1.03;
/** Pressed into the target: a tight, dark contact shadow. */
const SLAM_SHADOW = 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55))';
const DROP_SHADOW = /drop-shadow\((?:[^()]|\([^()]*\))*\)/g;

/**
 * The moments of a swing in ms, clamped so they always stay in order. Both the
 * movement and the shadow follow them.
 */
const swingTimes = (swing: HeroSwingSettings) => {
  const { totalMs } = swing;
  const impact = Math.min(swing.impactMs, totalMs - 1);
  const slamStart = Math.max(1, impact - swing.slamMs);
  const lift = Math.min(swing.liftMs, slamStart);
  const hold = Math.min(impact + swing.holdMs, totalMs - 1);
  const drift = hold + (totalMs - hold) * DRIFT_FRACTION;
  const settle = hold + (totalMs - hold) * SETTLE_FRACTION;
  return { totalMs, impact, slamStart, lift, hold, drift, settle };
};

/**
 * A hero's swing, with weight: it rises toward the viewer (bigger), hangs for
 * a beat, slams into the target at `impactMs`, then drifts home and settles
 * with a small squash. The shadow is animated separately
 * (`heroShadowFrames`).
 */
export const heroSwingFrames = (
  to: Point,
  swing: HeroSwingSettings = getHeroSwing(),
): Keyframe[] => {
  const { totalMs, impact, slamStart, lift, hold, drift, settle } =
    swingTimes(swing);
  const hit = { x: to.x * swing.reach, y: to.y * swing.reach };
  const t = (x: number, y: number, scaleX: number, scaleY = scaleX) =>
    `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;
  const frame = (transform: string, ms: number, easing?: string): Keyframe => ({
    transform,
    offset: ms / totalMs,
    easing,
  });
  const top = t(0, -swing.liftY, swing.liftScale);
  return [
    frame(t(0, 0, 1), 0, 'cubic-bezier(0.2, 0.7, 0.3, 1)'),
    frame(top, lift, 'ease-in-out'),
    frame(top, slamStart, 'cubic-bezier(0.7, 0, 1, 0.5)'),
    frame(t(hit.x, hit.y, swing.hitScale), impact, 'ease-out'),
    frame(
      t(
        hit.x,
        hit.y,
        swing.hitScale + HOLD_WIDEN,
        swing.hitScale * DRIFT_SCALE,
      ),
      hold,
      'ease-in-out',
    ),
    frame(t(0, -HOVER_OFFSET, DRIFT_SCALE), drift, 'ease-in-out'),
    frame(t(0, 0, SETTLE_SQUASH_X, swing.squash), settle, 'ease-out'),
    frame(t(0, 0, 1), totalMs),
  ];
};

/**
 * The hero's own shadow through the swing. `filter` is the figure's current
 * computed filter: any glow in front of the last drop-shadow is kept, and that
 * last one (the default dark shadow) is what lifts away, so the swing starts
 * and ends exactly on the default and never stacks a second shadow.
 */
export const heroShadowFrames = (
  filter: string,
  swing: HeroSwingSettings = getHeroSwing(),
): Keyframe[] => {
  const { totalMs, impact, slamStart, lift, hold, drift, settle } =
    swingTimes(swing);
  const shadows = filter.match(DROP_SHADOW) ?? [];
  const rest = shadows.length > 0 ? shadows[shadows.length - 1] : 'none';
  const glow = shadows.slice(0, -1).join(' ');
  const lifted = `drop-shadow(0 ${swing.shadowY}px ${swing.shadowBlur}px rgba(0, 0, 0, ${swing.shadowAlpha}))`;
  const frame = (shadow: string, ms: number): Keyframe => ({
    filter: `${glow} ${shadow}`.trim(),
    offset: ms / totalMs,
  });
  return [
    frame(rest, 0),
    frame(lifted, lift),
    frame(lifted, slamStart),
    frame(SLAM_SHADOW, impact),
    frame(SLAM_SHADOW, hold),
    frame(lifted, drift),
    frame(rest, settle),
    frame(rest, totalMs),
  ];
};

const centre = (el: HTMLElement): Point => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/**
 * The vector from `attacker`'s centre to `target`'s, read now (so it survives
 * either element leaving the page later).
 */
export const aimVector = (
  attacker: HTMLElement,
  target: HTMLElement,
): Point => {
  const a = centre(attacker);
  const t = centre(target);
  return { x: t.x - a.x, y: t.y - a.y };
};

/**
 * Throws `attacker` along `to` (see `aimVector`) and back. Raises it above its
 * neighbours for the duration.
 */
export const lungeBy = (
  attacker: HTMLElement,
  to: Point,
  isHero = false,
): void => {
  if (reducedMotion() || !attacker.animate || !attacker.isConnected) return;
  const prev = attacker.style.zIndex;
  attacker.style.zIndex = '60';
  const swing = getHeroSwing();
  const anim = isHero
    ? attacker.animate(heroSwingFrames(to, swing), {
        duration: swing.totalMs,
      })
    : attacker.animate(lungeFrames(to), { duration: LUNGE_MS });
  if (isHero) animateHeroShadow(attacker, swing);
  const done = () => {
    attacker.style.zIndex = prev;
  };
  anim.onfinish = done;
  anim.oncancel = done;
};

const FIGURE = '[class*="hero-variants_figure__"]';

/**
 * Runs the shadow animation on the figure inside the hero (where its default
 * shadow lives), or on the hero itself when it has no figure.
 */
const animateHeroShadow = (
  hero: HTMLElement,
  swing: HeroSwingSettings,
): void => {
  const figure = hero.querySelector<HTMLElement>(FIGURE) ?? hero;
  figure.animate(heroShadowFrames(getComputedStyle(figure).filter, swing), {
    duration: swing.totalMs,
  });
};

/** Throws `attacker` at `target` (both on screen) and back. */
export const lunge = (attacker: HTMLElement, target: HTMLElement): void =>
  lungeBy(attacker, aimVector(attacker, target));

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
    { duration: 260, delay: getImpactMs(), easing: 'ease-out' },
  );
};

/**
 * How long a played minion's card flies from the hand to its slot; the landing
 * waits for it.
 */
export const FLIGHT_MS = 380;

/**
 * The keyframes of a card flying from `from` to `to` (screen rects): it rises a
 * little, then swoops in and shrinks to the minion.
 */
export const flightFrames = (from: DOMRect, to: DOMRect): Keyframe[] => {
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const s = Math.max(0.25, to.width / from.width);
  return [
    {
      transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
      opacity: 1,
      offset: 0,
      easing: 'ease-out',
    },
    {
      transform: `translate(${dx * 0.15}px, ${dy * 0.15 - 36}px) scale(1.08) rotate(-3deg)`,
      opacity: 1,
      offset: 0.3,
      easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)',
    },
    {
      transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(0deg)`,
      opacity: 0.85,
      offset: 1,
    },
  ];
};

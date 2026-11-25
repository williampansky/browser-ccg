import { getSwing } from './hero-swing-tune';
import type { HeroSwingSettings, SwingKind } from './hero-swing-tune';

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
/** When the strike of an attack by this kind of attacker lands. */
export const swingImpactMs = (kind: SwingKind): number =>
  getSwing(kind).impactMs;

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

export interface Point {
  x: number;
  y: number;
}

/** How far through the time after the hold the drift home and the settle are. */
const DRIFT_FRACTION = 0.56;
const SETTLE_FRACTION = 0.8;
const HOVER_OFFSET = 6;
const DRIFT_SCALE = 1.04;
const HOLD_WIDEN = 0.02;
const SETTLE_SQUASH_X = 1.03;
/** Pressed into the target: a tight, dark contact shadow. */
const SLAM_SHADOW = 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55))';
const MINION_SLAM_SHADOW = 'rgba(0, 0, 0, 0.55) 0px 2px 3px 0px';
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
 * An attack swing, with weight: the attacker rises toward the viewer (bigger),
 * hangs for a beat, slams into the target at `impactMs`, then drifts home and
 * settles with a small squash. The shadow is animated separately
 * (`heroShadowFrames`, `minionShadowFrames`). `to` is the vector from the
 * attacker to the target centre.
 */
export const swingFrames = (
  to: Point,
  swing: HeroSwingSettings = getSwing('hero'),
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
 * The shadow through the swing, given the layers of the element's current
 * shadow and which one is the dark default that lifts away (the others, such
 * as a glow or a ring, stay). `join` puts the layers back together in the
 * property's own syntax. The swing starts and ends exactly on the default, so
 * a second shadow is never stacked on it.
 */
const shadowTimeline = (
  swing: HeroSwingSettings,
  layers: string[],
  dropAt: number,
  lifted: string,
  slam: string,
  join: (layers: string[]) => string,
): Keyframe[] => {
  const { totalMs, impact, slamStart, lift, hold, drift, settle } =
    swingTimes(swing);
  const withDrop = (drop: string) =>
    join(layers.map((layer, index) => (index === dropAt ? drop : layer)));
  const rest = join(layers);
  const frame = (shadow: string, ms: number): Keyframe => ({
    offset: ms / totalMs,
    shadow,
  });
  return [
    frame(rest, 0),
    frame(withDrop(lifted), lift),
    frame(withDrop(lifted), slamStart),
    frame(withDrop(slam), impact),
    frame(withDrop(slam), hold),
    frame(withDrop(lifted), drift),
    frame(rest, settle),
    frame(rest, totalMs),
  ];
};

/**
 * A hero's own shadow through the swing. `filter` is the figure's current
 * computed filter: any glow in front of the last drop-shadow is kept, and that
 * last one (the default dark shadow) is what lifts away.
 */
export const heroShadowFrames = (
  filter: string,
  swing: HeroSwingSettings = getSwing('hero'),
): Keyframe[] => {
  const layers = filter.match(DROP_SHADOW) ?? ['none'];
  const lifted = `drop-shadow(0 ${swing.shadowY}px ${swing.shadowBlur}px rgba(0, 0, 0, ${swing.shadowAlpha}))`;
  return shadowTimeline(
    swing,
    layers,
    layers.length - 1,
    lifted,
    SLAM_SHADOW,
    (parts) => parts.join(' ').trim(),
  ).map(({ offset, shadow }) => ({ offset, filter: shadow }));
};

/** Splits a `box-shadow` value at its top-level commas. */
const splitShadows = (boxShadow: string): string[] => {
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  Array.from(boxShadow).forEach((char, index) => {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      layers.push(boxShadow.slice(start, index).trim());
      start = index + 1;
    }
  });
  layers.push(boxShadow.slice(start).trim());
  return layers;
};

/**
 * A minion's shadow lives in the box-shadow of its oval. `boxShadow` is its
 * current computed value: the last layer that is not an inset is the dark
 * default that lifts away; rings and the inset edge stay.
 */
export const minionShadowFrames = (
  boxShadow: string,
  swing: HeroSwingSettings = getSwing('minion'),
): Keyframe[] => {
  if (boxShadow === 'none' || boxShadow === '') return [];
  const layers = splitShadows(boxShadow);
  const isOutset = (layer: string) => !layer.includes('inset');
  const dropAt = layers.map(isOutset).lastIndexOf(true);
  if (dropAt < 0) return [];
  const lifted = `rgba(0, 0, 0, ${swing.shadowAlpha}) 0px ${swing.shadowY}px ${swing.shadowBlur}px 0px`;
  return shadowTimeline(
    swing,
    layers,
    dropAt,
    lifted,
    MINION_SLAM_SHADOW,
    (parts) => parts.join(', '),
  ).map(({ offset, shadow }) => ({ offset, boxShadow: shadow }));
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
 * Throws `attacker` along `to` (see `aimVector`) with the swing of its `kind`:
 * a lift, a slam and a settle, its shadow lifting with it. Raises it above its
 * neighbours for the duration. Returns how long that takes (0 if nothing
 * played).
 */
export const lungeBy = (
  attacker: HTMLElement,
  to: Point,
  kind: SwingKind = 'minion',
): number => {
  if (reducedMotion() || !attacker.animate || !attacker.isConnected) return 0;
  const prev = attacker.style.zIndex;
  attacker.style.zIndex = '60';
  const swing = getSwing(kind);
  const anim = attacker.animate(swingFrames(to, swing), {
    duration: swing.totalMs,
  });
  animateShadow(attacker, kind, swing);
  const done = () => {
    attacker.style.zIndex = prev;
  };
  anim.onfinish = done;
  anim.oncancel = done;
  return swing.totalMs;
};

const FIGURE = '[class*="hero-variants_figure__"]';
const MINION_OVAL = '[class*="board-minion_oval__"]';

/**
 * Runs the shadow animation where the attacker's default shadow lives: on the
 * figure inside a hero (or the hero itself when it has no figure), or on the
 * oval of a minion.
 */
const animateShadow = (
  attacker: HTMLElement,
  kind: SwingKind,
  swing: HeroSwingSettings,
): void => {
  if (kind === 'hero') {
    const figure = attacker.querySelector<HTMLElement>(FIGURE) ?? attacker;
    figure.animate(heroShadowFrames(getComputedStyle(figure).filter, swing), {
      duration: swing.totalMs,
    });
    return;
  }
  const oval = attacker.querySelector<HTMLElement>(MINION_OVAL);
  if (!oval) return;
  const frames = minionShadowFrames(getComputedStyle(oval).boxShadow, swing);
  if (frames.length > 0) oval.animate(frames, { duration: swing.totalMs });
};

/** Throws `attacker` at `target` (both on screen) and back. */
export const lunge = (
  attacker: HTMLElement,
  target: HTMLElement,
  kind: SwingKind = 'minion',
): number => lungeBy(attacker, aimVector(attacker, target), kind);

/** How long the flash on a spell's target lasts. */
const HIT_FLASH_MS = 320;

/**
 * A quick white-hot flash on a target a spell hit: it brightens and fades back.
 * It waits for the same impact delay as the table jolt.
 */
export const flashHit = (target: HTMLElement): void => {
  if (reducedMotion() || !target.animate) return;
  const body =
    target.querySelector<HTMLElement>(MINION_OVAL) ??
    target.querySelector<HTMLElement>(FIGURE) ??
    target;
  body.animate(
    [
      { filter: 'brightness(1)' },
      { filter: 'brightness(3) saturate(0.4)', offset: 0.25 },
      { filter: 'brightness(1)' },
    ],
    { duration: HIT_FLASH_MS, delay: getImpactMs(), easing: 'ease-out' },
  );
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

import type { ParsedUrlQuery } from 'querystring';
import { useEffect, useRef } from 'react';
import {
  getHeroSwing,
  HERO_SWING_KNOBS,
  setHeroSwingTuning,
  swingFromQuery,
} from '../play-board/hero-swing-tune';
import { aimVector, lungeBy, nudge, setImpactMs } from '../play-board/motion';
import type { PanelProps } from './lab-panels';
import { one, row } from './lab-model';

import popStyles from '../play-board/float-delta.module.scss';

const HERO_ROOT = '[class*="hero-variants_root__"]';
const MINION_SLOT = '[class*="board-minion_slot__"]';

/** The URL key that picks what the preview swing aims at. */
export const SWING_TARGET_KEY = 'lswpv';
/** Preview-only keys all end in `pv`, so `npm run board` never bakes them. */
const SWING_LOOP_KEY = 'lswlpv';
const SWING_DAMAGE_KEY = 'lswdpv';

const SWING_KEYS = HERO_SWING_KNOBS.map((knob) => knob.key);

/**
 * Hands the URL's hero swing numbers to the board (the page runs it always, so
 * a real attack on the lab's board uses them too).
 */
export const useHeroSwingTuning = (q: ParsedUrlQuery): void => {
  const key = SWING_KEYS.map((k) => one(q[k])).join('|');
  useEffect(() => {
    setHeroSwingTuning(swingFromQuery((k) => one(q[k])));
    return () => setHeroSwingTuning(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

const button = (isOn: boolean) =>
  ({
    marginRight: 4,
    padding: '3px 10px',
    borderRadius: 6,
    border: '1px solid #3a4052',
    cursor: 'pointer',
    color: '#fff',
    background: isOn ? '#3d5afe' : '#232634',
  }) as const;

const TABLE = '[class*="play-board_table__"]';
/** The preview's damage: the lab's number box, with this as its default. */
const DEFAULT_DAMAGE = 4;
const POP_MS = 1050;
const SHAKE_PX = 7;
const SHAKE_MS = 450;
/** Damage from here up also jolts the table, like a real big hit. */
const JOLT_FROM = 4;
const LOOP_PAUSE_MS = 700;

const MINION_BODY = '[class*="board-minion_body__"]';

/** Keyframes of the board's own hurt shake (`minionShake`), for the preview. */
const shakeKeyframes = (): Keyframe[] => {
  const at = (dx: number, tilt: number) => ({
    translate: `${dx}px 0`,
    rotate: `${tilt}deg`,
  });
  return [
    at(0, 0),
    { ...at(-SHAKE_PX, -2), offset: 0.15 },
    { ...at(SHAKE_PX * 0.85, 1.5), offset: 0.35 },
    { ...at(-SHAKE_PX * 0.55, 0), offset: 0.55 },
    { ...at(SHAKE_PX * 0.3, 0), offset: 0.75 },
    at(0, 0),
  ];
};

/**
 * The target's shake and tilt when hurt, repeating the board's for the
 * preview: a minion's whole body (oval, frame, shield, badges) moves as one,
 * and a hero shakes as one piece too.
 */
const shakeTarget = (target: HTMLElement, isMinion: boolean): void => {
  const mover = isMinion
    ? target.querySelector<HTMLElement>(MINION_BODY)
    : target;
  if (mover?.animate) mover.animate(shakeKeyframes(), { duration: SHAKE_MS });
};

/** A red damage number over the target, like the board's FloatDelta. */
const popDamage = (target: HTMLElement, damage: number): void => {
  const pop = document.createElement('span');
  pop.className = `${popStyles.pop} ${popStyles.hurt}`;
  pop.textContent = `-${damage}`;
  target.appendChild(pop);
  setTimeout(() => pop.remove(), POP_MS);
};

/**
 * Plays the swing of the player's hero (the lower one on the board) at the
 * chosen target, and what it does on contact: the target shakes, a damage
 * number floats up and a big hit jolts the table. Nothing in the game state
 * changes. Returns how long the swing lasts, or 0 if there was nothing to
 * play.
 */
const playSwing = (isMinionTarget: boolean, damage: number): number => {
  const heroes = Array.from(document.querySelectorAll<HTMLElement>(HERO_ROOT));
  if (heroes.length < 2) return 0;
  const byTop = [...heroes].sort(
    (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
  );
  const mine = byTop[byTop.length - 1];
  const foeHero = byTop[0];
  const myTop = mine.getBoundingClientRect().top;
  const foeTop = foeHero.getBoundingClientRect().top;
  const isOnFoeSide = (slot: HTMLElement): boolean => {
    const { top } = slot.getBoundingClientRect();
    return top > foeTop && top < myTop;
  };
  const foeMinion = Array.from(
    document.querySelectorAll<HTMLElement>(MINION_SLOT),
  ).find(isOnFoeSide);
  const isMinion = isMinionTarget && !!foeMinion;
  const target = isMinion && foeMinion ? foeMinion : foeHero;
  const { impactMs, totalMs } = getHeroSwing();
  setImpactMs(impactMs);
  lungeBy(mine, aimVector(mine, target), true);
  // `nudge` waits for the impact time by itself.
  const table = document.querySelector<HTMLElement>(TABLE);
  if (table && damage >= JOLT_FROM) nudge(table, damage);
  setTimeout(() => {
    if (damage <= 0) return;
    shakeTarget(target, isMinion);
    popDamage(target, damage);
  }, impactMs);
  return totalMs;
};

/**
 * Plays the hero swing now, and what it aims at, with a box for the example
 * damage and a switch to repeat it for as long as you like.
 */
export const HeroSwingPreviewPanel = ({ q, setParams }: PanelProps) => {
  const isMinionTarget = one(q[SWING_TARGET_KEY]) === 'minion';
  const isLooping = one(q[SWING_LOOP_KEY]) === '1';
  const rawDamage = one(q[SWING_DAMAGE_KEY]);
  const damage = rawDamage === '' ? DEFAULT_DAMAGE : Math.max(0, +rawDamage);
  const latest = useRef({ isMinionTarget, damage });
  latest.current = { isMinionTarget, damage };

  useEffect(() => {
    if (!isLooping) return;
    let timer: ReturnType<typeof setTimeout>;
    const again = () => {
      const lasted = playSwing(
        latest.current.isMinionTarget,
        latest.current.damage,
      );
      timer = setTimeout(again, (lasted || 0) + LOOP_PAUSE_MS);
    };
    again();
    return () => clearTimeout(timer);
  }, [isLooping]);

  return (
    <>
      <small style={{ display: 'block', color: '#9aa3b8', fontSize: 11 }}>
        Plays your hero's attack swing on this board. On contact the target
        shakes, a damage number floats up and a big hit jolts the table, but no
        damage is dealt. The sliders below change it as you go; with "Repeat"
        on, the next round picks them up. Needs the figure heroes (Setup, Heroes
        and hand).
      </small>
      <div style={row}>
        <button
          style={button(false)}
          onClick={() => playSwing(isMinionTarget, damage)}
        >
          Play swing
        </button>
        <label style={{ marginLeft: 8 }}>
          <input
            type="checkbox"
            checked={isLooping}
            onChange={(e) =>
              setParams({ [SWING_LOOP_KEY]: e.target.checked ? '1' : null })
            }
          />{' '}
          Repeat
        </label>
      </div>
      <div style={row}>
        <span>Aim at</span>{' '}
        <button
          style={button(!isMinionTarget)}
          onClick={() => setParams({ [SWING_TARGET_KEY]: null })}
        >
          Enemy hero
        </button>
        <button
          style={button(isMinionTarget)}
          onClick={() => setParams({ [SWING_TARGET_KEY]: 'minion' })}
        >
          Enemy minion
        </button>
      </div>
      <label style={row}>
        Example damage{' '}
        <input
          type="number"
          min={0}
          value={rawDamage === '' ? DEFAULT_DAMAGE : rawDamage}
          style={{ width: 60 }}
          onChange={(e) => setParams({ [SWING_DAMAGE_KEY]: e.target.value })}
        />{' '}
        <small style={{ color: '#9aa3b8' }}>
          (0 = no shake or number; {JOLT_FROM}+ also jolts the table)
        </small>
      </label>
    </>
  );
};

/** The sliders for the swing, in groups. */
export const HeroSwingPanel = ({ sliders }: PanelProps) => (
  <>
    <b>Timing</b>
    {sliders(['lswt', 'lswi', 'lswl', 'lswk', 'lswh'])}
    <b>Motion</b>
    {sliders(['lswy', 'lsws', 'lswx', 'lswr', 'lswq'])}
    <b>Shadow when lifted</b>
    {sliders(['lswsy', 'lswsb', 'lswsa'])}
  </>
);

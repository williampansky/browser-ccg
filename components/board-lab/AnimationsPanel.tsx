import type { ParsedUrlQuery } from 'querystring';
import { useEffect, useRef } from 'react';
import { getSwing, SWINGS } from '../play-board/hero-swing-tune';
import type { SwingKind } from '../play-board/hero-swing-tune';
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

const KINDS: SwingKind[] = ['hero', 'minion'];
const ALL_KEYS = KINDS.flatMap((kind) =>
  SWINGS[kind].knobs.map((knob) => knob.key),
);

/**
 * Hands the URL's swing numbers (hero and minion) to the board (the page runs
 * it always, so a real attack on the lab's board uses them too).
 */
export const useSwingTuning = (q: ParsedUrlQuery): void => {
  const key = ALL_KEYS.map((k) => one(q[k])).join('|');
  useEffect(() => {
    KINDS.forEach((kind) =>
      SWINGS[kind].setTuning(SWINGS[kind].fromQuery((k) => one(q[k]))),
    );
    return () => KINDS.forEach((kind) => SWINGS[kind].setTuning(undefined));
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

/** Rows of minion slots closer than this share a side of the board. */
const ROW_TOLERANCE_PX = 20;

/**
 * The minions on each side of the board: the upper row is the enemy's, the
 * lower row is yours.
 */
const minionRows = (): { mine: HTMLElement[]; foe: HTMLElement[] } => {
  const slots = Array.from(document.querySelectorAll<HTMLElement>(MINION_SLOT));
  const tops = slots.map((slot) => slot.getBoundingClientRect().top);
  const upper = Math.min(...tops);
  const lower = Math.max(...tops);
  const isInRow = (row: number) => (slot: HTMLElement) =>
    Math.abs(slot.getBoundingClientRect().top - row) < ROW_TOLERANCE_PX;
  if (upper === lower) return { mine: [], foe: [] };
  return {
    mine: slots.filter(isInRow(lower)),
    foe: slots.filter(isInRow(upper)),
  };
};

/**
 * Plays the swing of your hero or of your first minion at the chosen target,
 * and what it does on contact: the target shakes, a damage number floats up
 * and a big hit jolts the table. Nothing in the game state changes. Returns
 * how long the swing lasts, or 0 if there was nothing to play.
 */
const playSwing = (
  kind: SwingKind,
  isMinionTarget: boolean,
  damage: number,
): number => {
  const heroes = Array.from(document.querySelectorAll<HTMLElement>(HERO_ROOT));
  if (heroes.length < 2) return 0;
  const byTop = [...heroes].sort(
    (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
  );
  const foeHero = byTop[0];
  const rows = minionRows();
  const attacker = kind === 'hero' ? byTop[byTop.length - 1] : rows.mine[0];
  if (!attacker) return 0;
  const foeMinion = rows.foe[0];
  const isMinion = isMinionTarget && !!foeMinion;
  const target = isMinion && foeMinion ? foeMinion : foeHero;
  const { impactMs, totalMs } = getSwing(kind);
  setImpactMs(impactMs);
  lungeBy(attacker, aimVector(attacker, target), kind);
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
export const SwingPreviewPanel = ({
  q,
  setParams,
  kind,
}: PanelProps & { kind: SwingKind }) => {
  const isMinionTarget = one(q[SWING_TARGET_KEY]) === 'minion';
  const isLooping = one(q[SWING_LOOP_KEY]) === '1';
  const rawDamage = one(q[SWING_DAMAGE_KEY]);
  const damage = rawDamage === '' ? DEFAULT_DAMAGE : Math.max(0, +rawDamage);
  const latest = useRef({ isMinionTarget, damage, kind });
  latest.current = { isMinionTarget, damage, kind };

  useEffect(() => {
    if (!isLooping) return;
    let timer: ReturnType<typeof setTimeout>;
    const again = () => {
      const lasted = playSwing(
        latest.current.kind,
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
        {kind === 'hero'
          ? "Plays your hero's attack swing"
          : "Plays your first minion's attack swing"}{' '}
        on this board. On contact the target shakes, a damage number floats up
        and a big hit jolts the table, but no damage is dealt. The sliders below
        change it as you go; with "Repeat" on, the next round picks them up.
        Needs the figure heroes (Setup, Heroes and hand).
      </small>
      <div style={row}>
        <button
          style={button(false)}
          onClick={() => playSwing(kind, isMinionTarget, damage)}
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

/** The sliders for a swing, in groups. */
export const SwingPanel = ({
  sliders,
  kind,
}: PanelProps & { kind: SwingKind }) => {
  const keys = SWINGS[kind].knobs.map((knob) => knob.key);
  const at = (from: number, to: number) => sliders(keys.slice(from, to));
  return (
    <>
      <b>Timing</b>
      {at(0, 5)}
      <b>Motion</b>
      {at(5, 10)}
      <b>Shadow when lifted</b>
      {at(10, 13)}
    </>
  );
};

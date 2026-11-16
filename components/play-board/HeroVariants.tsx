import React from 'react';
import { heroImage } from './hero-images';
import styles from './hero-variants.module.scss';
import cx from '../../utils/cx';

/**
 * PROTOTYPE hero displays 2 to 4 (option 1 is HeroBust): the standing figure, the big medallion and the hero as a framed card.
 * Dev preview only (pages/hero-lab.tsx); /play does not use them.
 */
export interface HeroVariantProps {
  heroId: string;
  name: string;
  health: number;
  maxHealth?: number;
  armor?: number;
  /** PROTOTYPE: an equipped weapon drawn over the portrait (HeroFigure only) */
  weapon?: { image?: string; attack: number; durability: number; name?: string; temporary?: boolean };
  team?: 'green' | 'red';
  active?: boolean;
  turnTag?: string;
}

const tone = (health: number, maxHealth: number) => (health <= maxHealth / 3 ? styles.low : health < maxHealth ? styles.hurt : '');
const art = (id: string) => `url(${heroImage(id, 'avatar')})`;
const root = (p: HeroVariantProps, extra: string) =>
  cx(styles.root, extra, p.team === 'red' ? styles.red : '', p.active ? styles.active : '');

/**
 * 2: the hero as a tall framed figure, laid out like the TCG Vol 14 sample card: portrait in the window, name on the ribbon, skills
 * in the text panel, big green gem = health (in the ring), blue gem = armor.
 * Positions are in the frame PNG's 857 x 1200 units, as percentages, so the card scales with its width.
 */
export interface FigureSkill {
  name: string;
  cost: number;
  text: string;
  /** Ready to use right now; false = dimmed and disabled (no energy, not your turn) */
  usable: boolean;
  /** Own turns left before it is ready again; 0 when ready */
  cooldownLeft: number;
  /** A one-use ultimate that has been used */
  spent: boolean;
  selected?: boolean;
  targeted?: boolean;
}

export interface FigureLive {
  /** The board tracks this node (aim arrows point at the hero) */
  rootRef?: (el: HTMLElement | null) => void;
  /** Ref for skill n's button (aim arrows start there) */
  skillRef?: (index: number) => (el: HTMLElement | null) => void;
  onSkill?: (index: number) => void;
  aim?: boolean;
  aimHover?: boolean;
  selected?: boolean;
  canAct?: boolean;
  /** Mouse, drag and click handlers for the whole card */
  dom?: React.HTMLAttributes<HTMLDivElement>;
}

export const HeroFigure = (p: HeroVariantProps & { skills?: FigureSkill[] } & FigureLive) => {
  const max = p.maxHealth ?? 30;
  const state = p.health <= max / 3 ? styles.low : p.health < max ? styles.hurt : styles.ok;
  return (
    <div
      {...p.dom}
      ref={p.rootRef}
      className={cx(root(p, styles.figure), p.canAct ? styles.canAct : '', p.aim ? styles.aim : '', p.aim && p.aimHover ? styles.aimHover : '', p.selected ? styles.sel : '')}
    >
      <div className={styles.figPic} style={{ backgroundImage: art(p.heroId) }} />
      <img className={styles.figFrame} src="/images/frames/HERO-VOL14.png" alt="" draggable={false} />
      {p.weapon && (
        <div
          className={cx(styles.figWeapon, p.weapon.image ? '' : styles.figWeaponBare, p.weapon.temporary ? styles.figWeaponTemp : '')}
          aria-label={`${p.weapon.name ?? 'Weapon'}: ${p.weapon.attack} attack, ${p.weapon.durability} durability${p.weapon.temporary ? ', this turn only' : ''}`}
        >
          {p.weapon.image && <img src={p.weapon.image} alt="" draggable={false} />}
          <b className={styles.figWpnAtk}>{p.weapon.attack}</b>
          <b className={styles.figWpnDur}>{p.weapon.durability}</b>
        </div>
      )}
      <span className={styles.figName}>{p.name}</span>
      <div className={styles.figSkills}>
        {[1, 2, 3].map((n) => {
          const k = p.skills?.[n - 1];
          const status = !k ? '' : k.spent ? 'Used' : k.cooldownLeft > 0 ? `Ready in ${k.cooldownLeft}` : '';
          return (
            <button
              key={n}
              ref={p.skillRef?.(n - 1)}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                p.onSkill?.(n - 1);
              }}
              disabled={!!k && !k.usable}
              aria-label={k ? `${k.name}, cost ${k.cost}${status ? `, ${status}` : ''}: ${k.text}` : `Skill ${n}`}
              className={cx(styles.figSkill, k?.usable ? styles.ready : '', k?.selected ? styles.picked : '', k && !k.usable ? styles.off : '')}
              style={{ backgroundImage: `url(${heroImage(p.heroId, `skill-${n}`)})` }}
            >
              {k && <b className={styles.figCost}>{k.cost}</b>}
              {k?.targeted && <i className={styles.figTarget}>⌖</i>}
              {status && <em className={styles.figStatus}>{k?.spent ? '✕' : k?.cooldownLeft}</em>}
              {k && (
                <span data-tip="" className={styles.figTip}>
                  <strong>{k.name}</strong>
                  {status && <em><small> ({status})</small></em>}
                  <br />
                  {k.text}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!!p.armor && (
        <span className={cx(styles.figGem, styles.figArmor)} aria-label={`${p.armor} armor`}>
          <b>{p.armor}</b>
        </span>
      )}
      <span className={cx(styles.figGem, styles.figHp, state)} aria-label={`${p.health} health`}>
        <b>{p.health}</b>
      </span>
    </div>
  );
};

/** 3: a big round portrait; health is the outer arc, armor a thinner arc inside it, the number sits at the bottom. */
export const HeroMedallion = (p: HeroVariantProps) => {
  const max = p.maxHealth ?? 30;
  const t = tone(p.health, max);
  const hp = t === styles.low ? '#a01212' : t === styles.hurt ? '#e0841f' : '#d8372c';
  return (
    <div className={root(p, styles.medal)}>
      <div
        className={styles.medalRing}
        style={{ ['--fill' as string]: `${(Math.min(p.health, max) / max) * 360}deg`, ['--hp' as string]: hp }}
      >
        {!!p.armor && <span className={styles.medalArmor} style={{ ['--armor' as string]: `${Math.min(p.armor / 15, 1) * 360}deg` }} />}
        <span className={styles.medalFace} style={{ backgroundImage: art(p.heroId) }} />
      </div>
      {p.turnTag && <span className={cx(styles.turnTag, styles.medalTag)}>{p.turnTag}</span>}
      <span className={cx(styles.hpGem, styles.medalHp, styles.num, t)}>{p.health}</span>
      <span className={styles.medalName}>{p.name}</span>
    </div>
  );
};

/** 4: the hero drawn like the hand cards: art in a rarity frame, name on the ribbon, health and armor in the corners. */
export const HeroCard = (p: HeroVariantProps) => {
  const max = p.maxHealth ?? 30;
  return (
    <div className={root(p, styles.card)}>
      <span className={styles.cardArt} style={{ backgroundImage: art(p.heroId) }} />
      <img className={styles.cardFrame} src={`/images/frames/${p.team === 'red' ? 'RED' : 'GREEN'}.png`} alt="" draggable={false} />
      <span className={styles.cardName}>{p.name}</span>
      <span className={cx(styles.hpGem, styles.num, tone(p.health, max))}>{p.health}</span>
      {!!p.armor && <span className={cx(styles.armorGem, styles.num)}>{p.armor}</span>}
      {p.turnTag && <span className={cx(styles.turnTag, styles.cardTag)}>{p.turnTag}</span>}
    </div>
  );
};

/**
 * 5: a thin dark ring with the portrait inside and the stats orbiting its rim like a watch face: the skills along the left (9 o'clock),
 * the weapon at 3 o'clock, a pill-shaped health badge at 6 o'clock and an armor pill beside it. Kept thin and dark so it does not read as
 * a thick sculpted bezel. Sizes are knobs (`ringD` ring diameter, `ringW` ring thickness, `socket` socket diameter, all px).
 * Angles are CSS ones: 0deg = 3 o'clock, 90deg = 6, 180deg = 9, 270deg = 12.
 */
const RING_SKILL_ANGLES = [225, 180, 135];
export const HeroRing = (p: HeroVariantProps & { skills?: FigureSkill[]; ringD?: number; ringW?: number; socket?: number }) => {
  const max = p.maxHealth ?? 30;
  const t = tone(p.health, max);
  return (
    <div
      className={root(p, styles.ring)}
      style={{ ['--ring-d' as string]: `${p.ringD ?? 96}px`, ['--ring-w' as string]: `${p.ringW ?? 2}px`, ['--sock' as string]: `${p.socket ?? 32}px` }}
    >
      <span className={styles.ringName}>{p.name}</span>
      {p.turnTag && <span className={cx(styles.turnTag, styles.ringTag)}>{p.turnTag}</span>}
      <div className={styles.ringDisc}>
        <span className={styles.ringArt} style={{ backgroundImage: art(p.heroId) }} />
      </div>
      {[1, 2, 3].map((n) => {
        const k = p.skills?.[n - 1];
        const status = !k ? '' : k.spent ? 'Used' : k.cooldownLeft > 0 ? `Ready in ${k.cooldownLeft}` : '';
        return (
          <button
            key={n}
            type="button"
            disabled={!!k && !k.usable}
            aria-label={k ? `${k.name}, cost ${k.cost}${status ? `, ${status}` : ''}: ${k.text}` : `Skill ${n}`}
            className={cx(styles.ringSock, styles.ringSkill, k?.usable ? styles.ready : '', k?.selected ? styles.picked : '', k && !k.usable ? styles.off : '')}
            style={{ ['--a' as string]: `${RING_SKILL_ANGLES[n - 1]}deg`, backgroundImage: `url(${heroImage(p.heroId, `skill-${n}`)})` }}
          >
            {k && <b className={styles.ringCost}>{k.cost}</b>}
            {status && <em className={styles.ringStatus}>{k?.spent ? '✕' : k?.cooldownLeft}</em>}
            {k && (
              <span data-tip="" className={styles.ringTip}>
                <strong>{k.name}</strong>
                {status && <em><small> ({status})</small></em>}
                <br />
                {k.text}
              </span>
            )}
          </button>
        );
      })}
      <div
        className={cx(styles.ringSock, styles.ringWeapon, p.weapon ? '' : styles.ringEmpty, p.weapon?.temporary ? styles.ringWeaponTemp : '')}
        style={{ ['--a' as string]: '0deg' }}
        aria-label={p.weapon ? `${p.weapon.name ?? 'Weapon'}: ${p.weapon.attack} attack, ${p.weapon.durability} durability` : 'No weapon'}
      >
        {p.weapon?.image && <img src={p.weapon.image} alt="" draggable={false} />}
        {p.weapon && (
          <>
            <b className={cx(styles.ringStat, styles.ringAtk, styles.num)}>{p.weapon.attack}</b>
            <b className={cx(styles.ringStat, styles.ringDur, styles.num)}>{p.weapon.durability}</b>
          </>
        )}
      </div>
      {!!p.armor && (
        <span className={cx(styles.ringPill, styles.ringArmor, styles.num)} style={{ ['--a' as string]: '55deg' }} aria-label={`${p.armor} armor`}>
          {p.armor}
        </span>
      )}
      <span className={cx(styles.ringPill, styles.ringHp, styles.num, t)} style={{ ['--a' as string]: '90deg' }} aria-label={`${p.health} health`}>
        {p.health}
      </span>
    </div>
  );
};

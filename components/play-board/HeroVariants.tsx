import React from 'react';
import { heroImage } from './hero-images';
import styles from './hero-variants.module.scss';

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
  weapon?: { image: string; attack: number; durability: number };
  team?: 'green' | 'red';
  active?: boolean;
  turnTag?: string;
}

const tone = (health: number, maxHealth: number) => (health <= maxHealth / 3 ? styles.low : health < maxHealth ? styles.hurt : '');
const art = (id: string) => `url(${heroImage(id, 'avatar')})`;
const root = (p: HeroVariantProps, extra: string) =>
  [styles.root, extra, p.team === 'red' ? styles.red : '', p.active ? styles.active : ''].join(' ');

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
      className={[root(p, styles.figure), p.canAct ? styles.canAct : '', p.aim ? styles.aim : '', p.aim && p.aimHover ? styles.aimHover : '', p.selected ? styles.sel : ''].join(' ')}
    >
      <div className={styles.figPic} style={{ backgroundImage: art(p.heroId) }} />
      <img className={styles.figFrame} src="/images/frames/HERO-VOL14.png" alt="" draggable={false} />
      {p.weapon && (
        <div className={styles.figWeapon} aria-label={`Weapon: ${p.weapon.attack} attack, ${p.weapon.durability} durability`}>
          <img src={p.weapon.image} alt="" draggable={false} />
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
              className={[styles.figSkill, k?.usable ? styles.ready : '', k?.selected ? styles.picked : '', k && !k.usable ? styles.off : ''].join(' ')}
              style={{ backgroundImage: `url(${heroImage(p.heroId, `skill-${n}`)})` }}
            >
              {k && <b className={styles.figCost}>{k.cost}</b>}
              {k?.targeted && <i className={styles.figTarget}>⌖</i>}
              {status && <em className={styles.figStatus}>{k?.spent ? '✕' : k?.cooldownLeft}</em>}
              {k && (
                <span className={styles.figTip}>
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
        <span className={[styles.figGem, styles.figArmor].join(' ')} aria-label={`${p.armor} armor`}>
          <b>{p.armor}</b>
        </span>
      )}
      <span className={[styles.figGem, styles.figHp, state].join(' ')} aria-label={`${p.health} health`}>
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
      {p.turnTag && <span className={[styles.turnTag, styles.medalTag].join(' ')}>{p.turnTag}</span>}
      <span className={[styles.hpGem, styles.medalHp, styles.num, t].join(' ')}>{p.health}</span>
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
      <span className={[styles.hpGem, styles.num, tone(p.health, max)].join(' ')}>{p.health}</span>
      {!!p.armor && <span className={[styles.armorGem, styles.num].join(' ')}>{p.armor}</span>}
      {p.turnTag && <span className={[styles.turnTag, styles.cardTag].join(' ')}>{p.turnTag}</span>}
    </div>
  );
};

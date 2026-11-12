import React from 'react';
import { energyPips, healthFraction, healthTone } from './hero-bar-model';
import styles from './hero-bar.module.scss';

export interface HeroBarWeapon {
  name: string;
  attack: number;
  durability: number;
}

interface HeroBarProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {
  name: string;
  /** What the avatar shows until heroes have portraits: "1", "2" or "AI". */
  emblem: string;
  /** Colour identity, matching the log: Player 1 green, Player 2 red. */
  team: 'green' | 'red';
  /** "your turn", "thinking...", or empty. */
  turnTag: string;
  active: boolean;
  health: number;
  armor: number;
  energy: { current: number; total: number };
  deck: number;
  hand: number;
  weapon: HeroBarWeapon | null;
  weaponDisabled: boolean;
  /** The avatar is what aim arrows point at, so the board tracks that node. */
  avatarRef?: (el: HTMLElement | null) => void;
  /** Interaction states (a legal target, hovered as one, selected as an attacker, able to attack: `canAct`). */
  aim?: boolean;
  aimHover?: boolean;
  selected?: boolean;
  canAct?: boolean;
}

/**
 * A hero's status bar: a ring-gauge avatar (health, armor), the name and turn, a row of energy slots, deck and hand
 * counts, and the weapon. The whole bar is the click/drop target.
 */
export const HeroBar = ({
  name,
  emblem,
  team,
  turnTag,
  active,
  health,
  armor,
  energy,
  deck,
  hand,
  weapon,
  weaponDisabled,
  avatarRef,
  aim,
  aimHover,
  selected,
  canAct,
  ...rest
}: HeroBarProps) => {
  const fraction = healthFraction(health);
  const tone = healthTone(fraction);
  const weaponText = weapon ? `${weapon.name} ${weapon.attack}/${weapon.durability}` : 'no weapon';
  return (
    <button
      type="button"
      aria-label={`${name}: ${health} health, ${armor} armor, energy ${energy.current} of ${energy.total}, ${deck} cards in deck, ${hand} in hand, ${weaponText}`}
      {...rest}
      className={[
        styles.bar,
        styles[team],
        active ? styles.active : '',
        canAct ? styles.canAct : '',
        aim ? styles.aim : '',
        aim && aimHover ? styles.aimHover : '',
        selected ? styles.selected : '',
      ].join(' ')}
    >
      <span
        ref={avatarRef}
        className={[styles.avatar, styles[tone]].join(' ')}
        style={{ ['--fill' as string]: `${Math.round(fraction * 360)}deg` }}
      >
        <span className={styles.face}>{emblem}</span>
        <span className={styles.hp} title={`${health} health`}>
          {health}
        </span>
        {armor > 0 && (
          <span className={styles.armor} title={`${armor} armor (absorbs attack damage)`}>
            {armor}
          </span>
        )}
      </span>

      <span className={styles.info}>
        <span className={styles.nameRow}>
          <strong>{name}</strong>
          {turnTag && <em className={styles.turn}>{turnTag}</em>}
        </span>
        <span className={styles.energy} title={`Energy: ${energy.current} available of ${energy.total}`}>
          <span className={styles.pips}>
            {energyPips(energy.current, energy.total).map((p, i) => (
              <i key={i} className={styles[p]} />
            ))}
          </span>
          <span className={styles.energyText}>
            {energy.current}/{energy.total}
          </span>
        </span>
        <span className={styles.counts}>
          <span title="Cards left in your deck">
            <i className={styles.iconDeck} />
            {deck}
          </span>
          <span title="Cards in hand">
            <i className={styles.iconHand} />
            {hand}
          </span>
        </span>
      </span>

      <span
        className={[styles.weapon, weapon ? '' : styles.noWeapon, weapon && canAct ? (selected ? styles.weaponSelected : styles.weaponReady) : ''].join(' ')}
        title={weapon ? weaponText : 'No weapon equipped'}>
        {weapon ? (
          <>
            <span className={styles.weaponName}>{weapon.name}</span>
            <span className={styles.weaponStats}>
              <b className={styles.atk}>{weapon.attack}</b>
              <b className={styles.dur}>{weapon.durability}</b>
            </span>
            {weaponDisabled && <span className={styles.disabled}>Disabled</span>}
          </>
        ) : (
          <span className={styles.weaponName}>No weapon</span>
        )}
      </span>
    </button>
  );
};

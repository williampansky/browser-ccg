import { energyPips, pipsToSpend } from './hero-bar-model';
import styles from './energy-bar.module.scss';

interface EnergyBarProps {
  current: number;
  total: number;
  /** Cost of the card being dragged or selected: the slots it would use blink. Leave out when no card is picked. */
  cost?: number;
}

/**
 * A tall column of energy orbs beside the board, filling from the bottom (hsclone's layout), big enough to read at a glance. The
 * hero bar keeps its small row. With a card picked, the orbs it would spend blink; if you cannot afford it every orb blinks red.
 */
export const EnergyBar = ({ current, total, cost }: EnergyBarProps) => {
  const pips = energyPips(current, total);
  const spend = cost === undefined ? pips.map(() => false) : pipsToSpend(pips, cost);
  const short = cost !== undefined && cost > current;
  return (
    <div className={styles.bar} role="img" aria-label={`Energy ${current} of ${total}`}>
      <b className={styles.count}>
        {current}
        <small>/{total}</small>
      </b>
      <div className={styles.orbs}>
        {pips
          .map((p, i) => (
            <i
              key={i}
              className={[styles.orb, styles[p], spend[i] ? (short ? styles.blinkRed : styles.blink) : ''].join(' ')}
            />
          ))
          .reverse()}
      </div>
    </div>
  );
};

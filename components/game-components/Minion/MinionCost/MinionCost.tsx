import { ReactElement } from 'react';
import styles from './minion-cost.module.scss';

export interface ReactMinionCostProps {
  cost: number;
  elite?: boolean;
  imageSrc?: string;
}

export const MinionCost = ({
  cost,
  elite = false,
  imageSrc,
}: ReactMinionCostProps): ReactElement => {
  return (
    <div
      className={styles['cost__wrapper']}
      data-component="MinionCost"
      data-value={cost}
    >
      <div
        className={[styles['text'], elite ? styles['elite'] : ''].join(' ')}
      >
        <div className="text__value">{cost}</div>
      </div>
      {elite ? (
        <img
          alt=""
          className={[styles['badge'], styles['elite']].join(' ')}
          role="presentation"
          src={imageSrc}
        />
      ) : (
        <img
          alt=""
          className={styles['badge']}
          role="presentation"
          src={imageSrc}
        />
      )}
    </div>
  );
};

import { ReactElement } from 'react';
import styles from './minion-power.module.scss';

export interface ReactMinionPowerProps {
  power: number;
  elite?: boolean;
  imageSrc?: string;
  alternate?: boolean;
}

export const MinionPower = ({
  power,
  elite = false,
  imageSrc,
  alternate = false,
}: ReactMinionPowerProps): ReactElement => {
  return (
    <div
      className={[
        styles['attack__wrapper'],
        alternate ? styles['alternate'] : '',
      ].join(' ')}
      data-component='MinionPower'
      data-value={power}
    >
      <div className={[styles['text'], elite ? styles['elite'] : ''].join(' ')}>
        <div className='text__value'>{power}</div>
      </div>
      {elite ? (
        <img
          alt=''
          className={[styles['badge'], styles['elite']].join(' ')}
          role='presentation'
          src={imageSrc}
        />
      ) : (
        <img
          alt=''
          className={styles['badge']}
          role='presentation'
          src={imageSrc}
        />
      )}
    </div>
  );
};

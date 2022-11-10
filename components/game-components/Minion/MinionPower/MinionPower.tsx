import { ReactElement } from 'react';
import styles from './minion-power.module.scss';

export interface ReactMinionPowerProps {
  basePower: number;
  currentPower: number;
  elite?: boolean;
  imageSrc?: string;
  alternate?: boolean;
}

export const MinionPower = ({
  basePower,
  currentPower,
  elite = false,
  imageSrc,
  alternate = false,
}: ReactMinionPowerProps): ReactElement => {
  return (
    <div
      className={[
        styles['attack__wrapper'],
        alternate ? styles['alternate'] : '',
        currentPower > basePower ? styles['power--buffed'] : '',
        basePower > currentPower ? styles['power--debuffed'] : '',
      ].join(' ')}
      data-component='MinionPower'
      data-value={currentPower}
    >
      <div className={[styles['text'], elite ? styles['elite'] : ''].join(' ')}>
        <div className='text__value'>{currentPower}</div>
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

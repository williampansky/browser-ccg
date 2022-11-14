import { ReactElement } from 'react';
import styles from './card-power.module.scss'

interface CardPowerProps {
  basePower: number;
  currentPower: number;
  elite?: boolean;
  badgeImgSrc?: string;
}

export const CardPower = ({
  basePower,
  currentPower,
  elite = false,
  badgeImgSrc,
}: CardPowerProps): ReactElement => {
  return (
    <div
      className={[
        styles['power'],
        elite ? styles['power__elite'] : '',
        currentPower > basePower ? styles['power--buffed'] : '',
        currentPower < basePower ? styles['power--debuffed'] : '',
      ].join(' ')}
    >
      <div className='text__value' data-value={currentPower}>
        {currentPower}
      </div>
      <img
        alt=''
        className={[
          styles['badge'],
          elite ? styles['badge__elite'] : '',
        ].join(' ')}
        role='presentation'
        src={badgeImgSrc}
      />
    </div>
  );
};

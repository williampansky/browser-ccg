import { ReactElement } from 'react';
import styles from './card-power.module.scss'

interface CardPowerProps {
  power: number;
  elite?: boolean;
  badgeImgSrc?: string;
}

export const CardPower = ({
  power,
  elite = false,
  badgeImgSrc,
}: CardPowerProps): ReactElement => {
  return (
    <div
      className={[
        styles['power'],
        elite ? styles['power__elite'] : '',
      ].join(' ')}
    >
      <div className='text__value' data-value={power}>
        {power}
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

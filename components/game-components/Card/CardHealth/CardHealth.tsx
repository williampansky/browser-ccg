import Image from 'next/image';
import BADGE_POWER from '../../../../public/images/card-assets/BADGE_POWER.png';
import styles from './card-health.module.scss';
import cx from '../../../../utils/cx';

interface CardHealthProps {
  base: number;
  current: number;
  elite?: boolean;
  isIncreased?: boolean;
  isReduced?: boolean;
}

export const CardHealth = ({
  base,
  current,
  elite = false,
  isIncreased = false,
  isReduced = false,
}: CardHealthProps) => {
  return (
    <div
      className={cx(
        styles['card__health'],
        elite ? styles['health__elite'] : '',
        isIncreased ? styles['card__health--buffed'] : '',
        isReduced ? styles['card__health--debuffed'] : '',
      )}
      data-component='CardHealth'
    >
      <div
        className='text__value text__value--shadow'
        data-value={current}
      >
        {current}
      </div>
      <Image src={BADGE_POWER} layout='fill' />
    </div>
  );
};

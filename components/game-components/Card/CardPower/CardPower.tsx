import Image from 'next/image';
import BADGE_POWER from '../../../../public/images/card-assets/BADGE_POWER.png';
import styles from './card-power.module.scss';
import cx from '../../../../utils/cx';

interface CardPowerProps {
  basePower: number;
  currentPower: number;
  elite?: boolean;
  isIncreased?: boolean;
  isReduced?: boolean;
}

export const CardPower = ({
  basePower,
  currentPower,
  elite = false,
  isIncreased = false,
  isReduced = false,
}: CardPowerProps) => {
  return (
    <div
      className={cx(
        styles['card__power'],
        elite ? styles['power__elite'] : '',
        isIncreased ? styles['card__power--buffed'] : '',
        isReduced ? styles['card__power--debuffed'] : '',
      )}
      data-component="CardPower"
    >
      <div
        className="text__value text__value--shadow"
        data-value={currentPower}
      >
        {currentPower}
      </div>
      <Image src={BADGE_POWER} layout="fill" />
    </div>
  );
};

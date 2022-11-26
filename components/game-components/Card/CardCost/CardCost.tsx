import Image from 'next/image';
import BADGE_COST from '../../../../public/images/card-assets/BADGE_COST.png';
import styles from './card-cost.module.scss';

interface CardCostProps {
  base: number;
  current: number;
  isIncreased?: boolean;
  isReduced?: boolean;
}

export const CardCost = ({
  base,
  current,
  isIncreased,
  isReduced,
}: CardCostProps) => {
  return (
    <div
      className={[
        styles['card__cost'],
        isIncreased ? styles['cost--increased'] : '',
        isReduced ? styles['cost--decreased'] : '',
      ].join(' ')}
      data-component='CardCost'
    >
      <div className='text__value text__value--shadow'>{current}</div>
      <Image src={BADGE_COST} layout='fill' />
    </div>
  );
};

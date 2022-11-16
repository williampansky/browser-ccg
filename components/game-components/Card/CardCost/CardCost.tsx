import Image from 'next/image';
import BADGE_COST from '../../../../public/images/card-assets/BADGE_COST.png'
import styles from './card-cost.module.scss';

interface CardCostProps {
  baseCost: number;
  currentCost: number;
}

export const CardCost = ({ baseCost, currentCost }: CardCostProps) => {
  return (
    <div
      className={[
        styles['card__cost'],
        currentCost > baseCost ? styles['cost--increased'] : '',
        currentCost < baseCost ? styles['cost--decreased'] : '',
      ].join(' ')}
      data-component="CardCost"
    >
      <div className='text__value text__value--shadow'>{currentCost}</div>
      <Image src={BADGE_COST} layout='fill' />
    </div>
  );
};

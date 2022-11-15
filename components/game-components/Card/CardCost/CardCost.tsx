import Image from 'next/image';
import BADGE_COST from '../../../../public/images/card-assets/BADGE_COST.png'
import { TextSVG } from '../../TextSVG';
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
    >
      {/* <div className='text__value'>{currentCost}</div> */}
      {/* {currentCost.toString() === '1' ? <TextSVG value={currentCost} /> :
        currentCost } */}
        <TextSVG value={currentCost} />
      <Image src={BADGE_COST} layout='fill' />
    </div>
  );
};

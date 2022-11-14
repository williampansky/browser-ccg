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
      <div className='text__value'>{currentCost}</div>
    </div>
  );
};

import { ReactElement } from 'react';
import styles from './card-cost.module.scss';

interface CardCostProps {
  cost: number;
}

export const CardCost = ({ cost }: CardCostProps): ReactElement => {
  return (
    <div className={styles['card__cost']}>
      <div className='text__value'>{cost}</div>
    </div>
  );
};

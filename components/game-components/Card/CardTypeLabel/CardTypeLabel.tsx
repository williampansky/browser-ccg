import { ReactElement } from 'react';
import styles from './card-type-label.module.scss';

interface CardTypeLabelProps {
  race?: string;
  type?: string;
  formatter?: any;
}

export const CardTypeLabel = ({
  race,
  type,
  formatter,
}: CardTypeLabelProps): ReactElement => {
  return (
    <div className={styles['card__type']}>
      {type === 'MINION' ? (
        race && race !== 'NONE' ? (
          <div>{formatter(race)}</div>
        ) : (
          <div>{formatter(type)}</div>
        )
      ) : (
        <div>{formatter(type)}</div>
      )}
    </div>
  );
};

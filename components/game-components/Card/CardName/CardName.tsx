import { ReactElement } from 'react';
import styles from './card-name.module.scss';

interface CardNameProps {
  formatter: (name: string) => {};
  name: string;
}

export const CardName = ({ formatter, name }: CardNameProps): ReactElement => {
  return (
    <div className={styles['card__name']}>
      <div
        className='text__value'
        style={{
          fontSize: `${formatter(name)}em`,
        }}
      >
        {name}
      </div>
    </div>
  );
};

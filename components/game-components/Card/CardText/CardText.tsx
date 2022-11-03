import { ReactElement } from 'react';
import styles from './card-text.module.scss';

interface CardTextProps {
  text?: {
    __html: string;
  };
}

export const CardText = ({ text }: CardTextProps): ReactElement | null => {
  return text ? (
    <div className={styles['card__text']}>
      <p className='text__value' dangerouslySetInnerHTML={text} />
    </div>
  ) : null;
};

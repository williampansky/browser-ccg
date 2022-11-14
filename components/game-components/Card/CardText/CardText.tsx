// import { Text } from '@visx/text';
import styles from './card-text.module.scss';

interface CardTextProps {
  // width: number;
  markup?: {
    __html: string
  };
}

export const CardText = ({ markup }: CardTextProps) => {
  return markup ? (
    <div className={styles['card__text']} data-component="CardText">
        {/* <Text
          children={html}
          className='text__value'
          fill='white'
          textAnchor='middle'
          verticalAnchor='middle'
          x={'50%'}
          y={'50%'}
          width={width}
          // scaleToFit={'shrink-only'}
        /> */}
      <p className='text__value' dangerouslySetInnerHTML={markup} />
    </div>
  ) : null;
};

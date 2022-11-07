// import { Text } from '@visx/text';
import styles from './card-text.module.scss';

interface CardTextProps {
  // width: number;
  text?: {
    __html: string;
  };
}

export const CardText = ({ text }: CardTextProps) => {
  const html = text && text.__html;
  return text ? (
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
      <p className='text__value' dangerouslySetInnerHTML={text} />
    </div>
  ) : null;
};

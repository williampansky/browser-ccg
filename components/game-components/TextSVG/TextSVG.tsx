// import styles from './card-power.module.scss'
import Image from 'next/image';
import Number0 from '../../../public/images/type/0.svg';
import Number1 from '../../../public/images/type/1.svg';
import Number2 from '../../../public/images/type/2.svg';
import Number3 from '../../../public/images/type/3.svg';
import Number4 from '../../../public/images/type/4.svg';
import Number5 from '../../../public/images/type/5.svg';
import Number6 from '../../../public/images/type/6.svg';
import Number7 from '../../../public/images/type/7.svg';
import Number8 from '../../../public/images/type/8.svg';
import Number9 from '../../../public/images/type/9.svg';

interface TextSvgProps {
  value?: any;
}

export const TextSVG = ({ value }: TextSvgProps) => {
  if (!value) return <span data-component='TextSVG'></span>;
  switch (value?.toString()) {
    case '0':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number0 /></span>;
    case '1':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number1 /></span>;
    case '2':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number2 /></span>;
    case '3':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number3 /></span>;
    case '4':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number4 /></span>;
    case '5':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number5 /></span>;
    case '6':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number6 /></span>;
    case '7':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number7 /></span>;
    case '8':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number8 /></span>;
    case '9':
      return <span className='bccg-icon bccg-preserve' data-component='TextSVG'><Number9 /></span>;
    default:
      return <span data-component='TextSVG'></span>;
  }
};

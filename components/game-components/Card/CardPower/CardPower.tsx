import { TextSVG } from '../../TextSVG';
import BADGE_POWER from '../../../../public/images/card-assets/BADGE_POWER.png'
import styles from './card-power.module.scss'
import Image from 'next/image';

interface CardPowerProps {
  basePower: number;
  currentPower: number;
  elite?: boolean;
  badgeImgSrc?: string;
}

export const CardPower = ({
  basePower,
  currentPower,
  elite = false,
  badgeImgSrc,
}: CardPowerProps) => {
  return (
    <div
      className={[
        styles['power'],
        elite ? styles['power__elite'] : '',
        currentPower > basePower ? styles['power--buffed'] : '',
        currentPower < basePower ? styles['power--debuffed'] : '',
      ].join(' ')}
    >
      {/* <div className='text__value' data-value={currentPower}> */}
        {/* {currentPower.toString() === '0' ? <TextSVG value={currentPower} /> :
        currentPower } */}
        <TextSVG value={currentPower} />
        {/* {currentPower} */}
      {/* </div> */}
      <Image src={BADGE_POWER} layout='fill' />
      {/* <img
        alt=''
        className={[
          styles['badge'],
          elite ? styles['badge__elite'] : '',
        ].join(' ')}
        role='presentation'
        src={badgeImgSrc}
      /> */}
    </div>
  );
};

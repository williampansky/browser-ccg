import Image from 'next/image';
import TYPE_WRAPPER from '../../../../public/images/card-assets/TYPE_WRAPPER.png';
import styles from './minion-power.module.scss';

export interface ReactMinionPowerProps {
  basePower: number;
  currentPower: number;
  elite?: boolean;
  imageSrc?: string;
  alternate?: boolean;
}

export const MinionPower = ({
  basePower,
  currentPower,
  elite = false,
  imageSrc,
  alternate = false,
}: ReactMinionPowerProps) => {
  return (
    <div
      className={[
        styles['attack__wrapper'],
        alternate ? styles['alternate'] : '',
        currentPower > basePower ? styles['power--buffed'] : '',
        basePower > currentPower ? styles['power--debuffed'] : '',
      ].join(' ')}
      data-component='MinionPower'
      data-value={currentPower}
    >
      <div className={[styles['text'], elite ? styles['elite'] : ''].join(' ')}>
        <div className='text__value'>{currentPower}</div>
      </div>
      {elite ? (
        <Image
          alt=''
          className={[styles['badge'], styles['elite']].join(' ')}
          role='presentation'
          layout='fill'
          src={TYPE_WRAPPER}
        />
      ) : (
        <Image
          alt=''
          className={styles['badge']}
          role='presentation'
          layout='fill'
          src={TYPE_WRAPPER}
        />
      )}
    </div>
  );
};

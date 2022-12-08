import Image from 'next/image';
import TYPE_WRAPPER from '../../../../public/images/card-assets/TYPE_WRAPPER.png';
import styles from './minion-power.module.scss';

export interface MinionPowerProps {
  base: number;
  current: number;
  elite?: boolean;
  alternate?: boolean;
  isIncreased?: boolean;
  isReduced?: boolean;
  isDestroyed?: boolean;
}

export const MinionPower = ({
  base,
  current,
  elite = false,
  alternate = false,
  isIncreased = false,
  isReduced = false,
  isDestroyed = false,
}: MinionPowerProps) => {
  return (
    <div
      className={[
        styles['attack__wrapper'],
        alternate ? styles['alternate'] : '',
        isIncreased ? styles['power--buffed'] : '',
        isReduced ? styles['power--debuffed'] : '',
        isDestroyed ? styles['power--nulled'] : '',
      ].join(' ')}
      data-component='MinionPower'
      data-value={current}
    >
      <div className={[styles['text'], elite ? styles['elite'] : ''].join(' ')}>
        <div className='text__value'>{current}</div>
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

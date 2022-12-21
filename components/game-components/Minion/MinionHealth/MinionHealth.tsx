import Image from 'next/image';
import TYPE_WRAPPER from '../../../../public/images/card-assets/TYPE_WRAPPER.png';
import styles from './minion-health.module.scss';

export interface MinionHealthProps {
  base: number;
  current: number;
  elite?: boolean;
  alternate?: boolean;
  isIncreased?: boolean;
  isReduced?: boolean;
  isDestroyed?: boolean;
}

export const MinionHealth = ({
  base,
  current,
  elite = false,
  alternate = false,
  isIncreased = false,
  isReduced = false,
  isDestroyed = false,
}: MinionHealthProps) => {
  return (
    <div
      className={[
        styles['health__wrapper'],
        alternate ? styles['alternate'] : '',
        isIncreased ? styles['power--buffed'] : '',
        isReduced ? styles['power--debuffed'] : '',
        isDestroyed ? styles['power--is-destroyed'] : '',
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

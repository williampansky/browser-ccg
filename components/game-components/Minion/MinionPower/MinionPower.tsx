import Image from 'next/image';
import TYPE_WRAPPER from '../../../../public/images/card-assets/TYPE_WRAPPER.png';
import styles from './minion-power.module.scss';

export interface ReactMinionPowerProps {
  base: number;
  current: number;
  elite?: boolean;
  alternate?: boolean;
}

export const MinionPower = ({
  base,
  current,
  elite = false,
  alternate = false,
}: ReactMinionPowerProps) => {
  return (
    <div
      className={[
        styles['attack__wrapper'],
        alternate ? styles['alternate'] : '',
        current > base ? styles['power--buffed'] : '',
        base > current ? styles['power--debuffed'] : '',
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

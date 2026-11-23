import Image from 'next/image';
import TYPE_WRAPPER from '../../../../public/images/card-assets/TYPE_WRAPPER.png';
import styles from './minion-power.module.scss';
import cx from '../../../../utils/cx';

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
      className={cx(
        styles['attack__wrapper'],
        alternate ? styles['alternate'] : '',
        isIncreased ? styles['power--buffed'] : '',
        isReduced ? styles['power--debuffed'] : '',
        isDestroyed ? styles['power--nulled'] : '',
      )}
      data-component="MinionPower"
      data-value={current}
    >
      <div className={cx(styles['text'], elite ? styles['elite'] : '')}>
        <div className="text__value">{current}</div>
      </div>
      {elite ? (
        <Image
          alt=""
          className={cx(styles['badge'], styles['elite'])}
          role="presentation"
          layout="fill"
          src={TYPE_WRAPPER}
        />
      ) : (
        <Image
          alt=""
          className={styles['badge']}
          role="presentation"
          layout="fill"
          src={TYPE_WRAPPER}
        />
      )}
    </div>
  );
};

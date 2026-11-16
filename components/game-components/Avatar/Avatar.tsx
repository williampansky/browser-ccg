import Image from 'next/image';
import styles from './avatar.module.scss';
import cx from '../../../utils/cx';

interface Player {
  
}

export const Avatar = () => {
  return (
    <div
      className={cx(styles['component'])}
      data-component='Avatar'
    >
      <Image
        layout='fill'
        src='/images/AVATAR.jpg'
      />
    </div>
  );
};

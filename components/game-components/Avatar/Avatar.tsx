import Image from 'next/image';
import styles from './avatar.module.scss';

interface Player {
  
}

export const Avatar = () => {
  return (
    <div
      className={[styles['component']].join(' ')}
      data-component='Avatar'
    >
      <Image
        layout='fill'
        src='/images/AVATAR.jpg'
      />
    </div>
  );
};

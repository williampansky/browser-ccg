import { ReactNode } from 'react';
import styles from './player-bar.module.scss';

interface PlayerBarProps {
  children: ReactNode;
}

export const PlayerBar = ({ children }: PlayerBarProps) => {
  return (
    <div className={styles['component']} data-component='PlayerBar'>
      <div className={styles['inner']}>{children}</div>
    </div>
  );
};

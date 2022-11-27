import type { PlayerID } from '../../../types';
import styles from './TheTurnTextOverlay.module.scss';

interface Props {
  currentPlayer: PlayerID;
  yourID: PlayerID;
}

export const TheTurnTextOverlay = ({ currentPlayer, yourID }: Props) => {
  return (
    <div
      className={styles['component']}
      data-component='TheTurnTextOverlay'
      style={{
        display: currentPlayer === yourID ? 'flex' : 'none',
      }}
    >
      <h1 className='text__value text__value--shadow'>
        <em>Your turn!</em>
      </h1>
    </div>
  );
};

import type { ReactElement } from 'react';
import type { Player as PlayerState } from '../../../types';
import styles from './player.module.scss';

interface Player {
  player: PlayerState;
}

export const Player = ({ player }: Player): ReactElement => {
  const { actionPoints, cards, displayName, playerId } = player;
  return (
    <div
      className={[styles['component']].join(' ')}
      data-component='Player'
      data-playerid={playerId}
    ></div>
  );
};

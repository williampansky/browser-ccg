import { ReactElement } from 'react';
import styles from './end-turn-button.module.scss';

export interface EndTurnButton {
  currentTurn: number;
  isDisabled: boolean;
  onClick: () => void;
  turnsPerGame: number;
}

export const EndTurnButton = ({
  currentTurn,
  isDisabled,
  onClick,
  turnsPerGame,
}: EndTurnButton): ReactElement => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={styles['component']}
    >
      {isDisabled ? 'Waiting ' : 'End Turn '}
      {currentTurn}/{turnsPerGame}
    </button>
  );
};

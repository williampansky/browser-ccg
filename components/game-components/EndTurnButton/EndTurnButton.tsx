import { useEffect, useState } from 'react';
import styles from './end-turn-button.module.scss';

export interface Props {
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
}: Props) => {
  const [clicked, setClicked] = useState<boolean>(false);

  const onButtonClick = () => {
    setClicked(true);
    return onClick();
  };

  useEffect(() => {
    setClicked(false);
  }, [currentTurn]);

  return (
    <button
      onClick={onButtonClick}
      disabled={clicked || isDisabled}
      className={styles['component']}
    >
      <span className='text__value'>
        {clicked || isDisabled ? 'Waiting ' : 'End Turn '}
        {currentTurn}/{turnsPerGame}
      </span>
    </button>
  );
};

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../pages/play/store';
import { PlayerID } from '../types';
import { GameOver } from '../types/g.interface';

const useGameOver = (ctxGameOver: GameOver): boolean => {
  // const { draw, winner } = useSelector(({ gameOver }: RootState) => gameOver);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);

  useEffect(() => {
    if (ctxGameOver) {
      setTimeout(() => setShowGameOver(true), 2000);
    }
  }, [ctxGameOver]);

  return showGameOver;
};

export default useGameOver;

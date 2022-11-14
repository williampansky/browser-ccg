import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setGameOver } from '../features';
import { GameOver } from '../types/g.interface';

const useGameOver = (ctxGameOver: GameOver): void => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (ctxGameOver) {
      setTimeout(() => dispatch(setGameOver(ctxGameOver)), 2000);
    }
  }, [ctxGameOver]);
};

export default useGameOver;

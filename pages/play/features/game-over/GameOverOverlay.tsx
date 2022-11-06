import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import type { GameOver, PlayerID } from '../../../../types';
import type { RootState } from '../../store';
import styles from './game-over-overlay.module.scss';

interface GameOverOverlayComponent {
  playerId: PlayerID | null;
  reset?: any;
}

export const GameOverOverlay = ({
  playerId,
  reset,
}: GameOverOverlayComponent): ReactElement => {
  const gameOver = useSelector(({ gameOver }: RootState) => gameOver);

  const getWinner = (ctxGameOver?: GameOver) => {
    if (!ctxGameOver) return null;
    if (ctxGameOver.draw) return 'Draw...';

    if (ctxGameOver.winner === '0') {
      if (playerId === '0') return 'Victory!';
      else return 'Defeat...';
    }

    if (ctxGameOver.winner === '1') {
      if (playerId === '1') return 'Victory!';
      else return 'Defeat...';
    }
  };

  const resetGame = () => {
    reset();
    setTimeout(() => window.location.reload());
  };

  return (
    <div
      className={[
        styles['component'],
        gameOver.draw || gameOver.winner ? styles['active'] : '',
      ].join(' ')}
    >
      <h2>{getWinner(gameOver)}</h2>
      <div
        style={{
          display: 'flex',
          flexFlow: 'column nowrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h3>
          <button onClick={() => resetGame()}>Replay?</button>
        </h3>
      </div>
    </div>
  );
};

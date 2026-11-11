import type { Draft } from 'immer';
import type { GameEvent, GameState } from '../state/types';

/** Ends the game if a hero is at 0 health. Both at 0 is a draw. Call inside `produce`. */
export const checkWin = (g: Draft<GameState>, events: GameEvent[]): void => {
  if (g.status === 'over') return;
  const dead0 = g.players['0'].health <= 0;
  const dead1 = g.players['1'].health <= 0;
  if (!dead0 && !dead1) return;
  g.status = 'over';
  g.winner = dead0 && dead1 ? 'draw' : dead0 ? '1' : '0';
  events.push({ type: 'GameOver', winner: g.winner });
};

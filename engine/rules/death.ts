import type { Draft } from 'immer';
import { GameEvent, GameState, PlayerId } from '../state/types';

/**
 * Removes every minion at 0 health from both boards, keeping boards dense.
 * Active player's side first, then the opponent's. Call inside `produce`.
 * (Death effects and Q15's exact removal order arrive with triggers, slice 5.)
 */
export const settleDeaths = (g: Draft<GameState>, events: GameEvent[]): void => {
  const order: PlayerId[] = g.activePlayer === '0' ? ['0', '1'] : ['1', '0'];
  for (const player of order) {
    const board = g.players[player].board;
    for (const m of board.filter((x) => x.health <= 0)) {
      events.push({ type: 'MinionDied', player, instanceId: m.instanceId });
    }
    g.players[player].board = board.filter((x) => x.health > 0);
  }
};

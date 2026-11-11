import type { GameState, MinionInstance, PlayerId } from '../state/types';

/** Finds a minion on either board. */
export const findMinion = (
  state: GameState,
  instanceId: number
): { owner: PlayerId; minion: MinionInstance } | undefined => {
  for (const owner of ['0', '1'] as PlayerId[]) {
    const minion = state.players[owner].board.find((m) => m.instanceId === instanceId);
    if (minion) return { owner, minion };
  }
  return undefined;
};

export const opponentOf = (player: PlayerId): PlayerId => (player === '0' ? '1' : '0');

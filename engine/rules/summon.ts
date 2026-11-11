import type { Draft } from 'immer';
import type { Card } from '../cards/types';
import { GameEvent, GameState, MAX_BOARD, PlayerId } from '../state/types';
import { createMinion } from './minion';

/**
 * Puts a new minion on `owner`'s board, just right of `besideId` if that minion is there, otherwise
 * at the far right. A full board (7) means nothing happens (RULES Q7). Returns whether it was summoned.
 * Call inside `produce`.
 */
export const summonMinion = (
  g: Draft<GameState>,
  owner: PlayerId,
  card: Card,
  events: GameEvent[],
  besideId?: number
): boolean => {
  const board = g.players[owner].board;
  if (board.length >= MAX_BOARD) return false;
  const beside = besideId === undefined ? -1 : board.findIndex((m) => m.instanceId === besideId);
  const index = beside >= 0 ? beside + 1 : board.length;
  const minion = createMinion(card, g.nextInstanceId++, g.turn, g.nextPlaySeq++);
  board.splice(index, 0, minion);
  events.push({ type: 'MinionSummoned', player: owner, instanceId: minion.instanceId, cardId: card.id });
  return true;
};

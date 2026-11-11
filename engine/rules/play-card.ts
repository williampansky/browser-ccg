import { produce } from 'immer';
import type { CardCatalog } from '../cards/types';
import { ActionError, GameEvent, GameState, MAX_BOARD } from '../state/types';
import { createMinion } from './minion';

export interface PlayCardArgs {
  handIndex: number;
  boardIndex?: number;
}

/** Plays a minion from the active player's hand. Spells and weapons come in later slices. */
export const playCard = (
  state: GameState,
  { handIndex, boardIndex }: PlayCardArgs,
  catalog: CardCatalog,
  events: GameEvent[]
): GameState | ActionError => {
  const me = state.activePlayer;
  const player = state.players[me];

  const inHand = player.hand[handIndex];
  if (!Number.isInteger(handIndex) || !inHand) return { error: 'BAD_HAND_INDEX' };
  const card = catalog.get(inHand.cardId);
  if (!card) return { error: 'UNKNOWN_CARD' };
  if (card.type !== 'minion') return { error: 'UNSUPPORTED_CARD' };

  const index = boardIndex ?? player.board.length;
  if (!Number.isInteger(index) || index < 0 || index > player.board.length) return { error: 'BAD_BOARD_INDEX' };
  if (card.cost > player.energy.current) return { error: 'CANT_AFFORD' };
  if (player.board.length >= MAX_BOARD) return { error: 'BOARD_FULL' };

  return produce(state, (g) => {
    const p = g.players[me];
    p.hand.splice(handIndex, 1);
    p.energy.current -= card.cost;
    p.board.splice(index, 0, createMinion(card, inHand.instanceId, g.turn));
    events.push({ type: 'MinionPlayed', player: me, instanceId: inHand.instanceId, boardIndex: index });
  });
};

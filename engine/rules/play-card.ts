import { produce } from 'immer';
import type { CardCatalog } from '../cards/types';
import { getCardDef } from '../definitions';
import type { Rng } from '../rng';
import { ActionError, GameEvent, GameState, MAX_BOARD, TargetRef } from '../state/types';
import { createMinion } from './minion';
import { settleDeaths } from './death';
import { isLegalTarget, legalTargets } from './targeting';
import { checkWin } from './win';

export interface PlayCardArgs {
  handIndex: number;
  boardIndex?: number;
  target?: TargetRef;
}

/** Plays a minion or a spell from the active player's hand. Weapons come in a later slice. */
export const playCard = (
  state: GameState,
  { handIndex, boardIndex, target }: PlayCardArgs,
  ctx: { catalog: CardCatalog; rng: Rng },
  events: GameEvent[]
): GameState | ActionError => {
  const { catalog, rng } = ctx;
  const me = state.activePlayer;
  const player = state.players[me];

  const inHand = player.hand[handIndex];
  if (!Number.isInteger(handIndex) || !inHand) return { error: 'BAD_HAND_INDEX' };
  const card = catalog.get(inHand.cardId);
  if (!card) return { error: 'UNKNOWN_CARD' };

  if (card.type === 'minion') {
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
  }

  if (card.type !== 'spell') return { error: 'UNSUPPORTED_CARD' };
  const def = getCardDef(card);
  if (!def) return { error: 'UNSUPPORTED_CARD' };
  if (card.cost > player.energy.current) return { error: 'CANT_AFFORD' };
  if (def.target) {
    if (!isLegalTarget(legalTargets(state, { kind: 'card', handIndex }, catalog), target)) {
      return { error: 'ILLEGAL_TARGET' };
    }
  } else if (target) {
    return { error: 'ILLEGAL_TARGET' };
  }

  return produce(state, (g) => {
    const p = g.players[me];
    p.hand.splice(handIndex, 1);
    p.energy.current -= card.cost;
    events.push({ type: 'CardPlayed', player: me, instanceId: inHand.instanceId, cardId: card.id });
    for (const effect of def.onPlay) effect({ g, caster: me, target, rng, catalog, events });
    settleDeaths(g, events);
    checkWin(g, events);
  });
};

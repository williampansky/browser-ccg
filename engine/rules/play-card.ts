import { produce } from 'immer';
import { getCardDef } from '../definitions';
import type { EngineContext } from './apply-action';
import { ActionError, GameEvent, GameState, MAX_BOARD, TargetRef } from '../state/types';
import { createMinion } from './minion';
import { isLegalTarget, legalTargets } from './targeting';

export interface PlayCardArgs {
  handIndex: number;
  boardIndex?: number;
  target?: TargetRef;
}

/**
 * Plays a minion or a spell from the active player's hand. A minion is placed first, then its
 * warcry (`onPlay`) runs. Weapons come in a later slice. Deaths and triggers are settled by the caller.
 */
export const playCard = (
  state: GameState,
  { handIndex, boardIndex, target }: PlayCardArgs,
  ctx: EngineContext,
  events: GameEvent[]
): GameState | ActionError => {
  const { catalog, rng } = ctx;
  const defs = ctx.defs ?? getCardDef;
  const me = state.activePlayer;
  const player = state.players[me];

  const inHand = player.hand[handIndex];
  if (!Number.isInteger(handIndex) || !inHand) return { error: 'BAD_HAND_INDEX' };
  const card = catalog.get(inHand.cardId);
  if (!card) return { error: 'UNKNOWN_CARD' };
  if (card.type !== 'minion' && card.type !== 'spell') return { error: 'UNSUPPORTED_CARD' };

  const def = defs(card);
  if (card.type === 'spell' && !def) return { error: 'UNSUPPORTED_CARD' };
  if (card.cost > player.energy.current) return { error: 'CANT_AFFORD' };

  let index = 0;
  if (card.type === 'minion') {
    index = boardIndex ?? player.board.length;
    if (!Number.isInteger(index) || index < 0 || index > player.board.length) return { error: 'BAD_BOARD_INDEX' };
    if (player.board.length >= MAX_BOARD) return { error: 'BOARD_FULL' };
  }

  // Targets. A spell that needs a target and has none is refused. A warcry with no legal target
  // still lets the minion be played; the warcry just does nothing.
  if (def?.target) {
    const legal = legalTargets(state, { kind: 'card', handIndex }, catalog, defs);
    if (legal.length > 0 || card.type === 'spell') {
      if (!isLegalTarget(legal, target)) return { error: 'ILLEGAL_TARGET' };
    } else if (target) {
      return { error: 'ILLEGAL_TARGET' };
    }
  } else if (target) {
    return { error: 'ILLEGAL_TARGET' };
  }

  return produce(state, (g) => {
    const p = g.players[me];
    p.hand.splice(handIndex, 1);
    p.energy.current -= card.cost;
    let self: number | undefined;
    if (card.type === 'minion') {
      const minion = createMinion(card, inHand.instanceId, g.turn, g.nextPlaySeq++);
      p.board.splice(index, 0, minion);
      self = minion.instanceId;
      events.push({ type: 'MinionPlayed', player: me, instanceId: self, boardIndex: index });
      events.push({ type: 'MinionSummoned', player: me, instanceId: self, cardId: card.id });
    } else {
      events.push({ type: 'CardPlayed', player: me, instanceId: inHand.instanceId, cardId: card.id });
    }
    for (const effect of def?.onPlay ?? []) {
      effect({ g, caster: me, target, self, rng, catalog, events, sourceCardId: card.id });
    }
  });
};

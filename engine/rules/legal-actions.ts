import type { CardCatalog } from '../cards/types';
import { getCardDef } from '../definitions';
import type { DefLookup } from '../definitions/define-card';
import { Action, GameState, MAX_BOARD, PlayerId } from '../state/types';
import { cantAttack } from './attack';
import { legalTargets } from './targeting';

/**
 * Every action `player` could take right now that `applyAction` would accept. Empty unless it is
 * that player's turn and the game is still on. Minions are offered at the far left and far right
 * of the board only (not every gap), which keeps the list small for bots; the UI can still send
 * any valid `boardIndex`.
 */
export const legalActions = (
  state: GameState,
  player: PlayerId,
  catalog: CardCatalog,
  defs: DefLookup = getCardDef
): Action[] => {
  if (state.status === 'over' || state.activePlayer !== player) return [];
  const me = state.players[player];
  const actions: Action[] = [{ type: 'EndTurn' }];

  me.hand.forEach((inHand, handIndex) => {
    const card = catalog.get(inHand.cardId);
    if (!card || card.cost > me.energy.current) return;
    const def = defs(card);
    if (card.type === 'spell') {
      if (!def) return;
      if (!def.target) return void actions.push({ type: 'PlayCard', handIndex });
      for (const target of legalTargets(state, { kind: 'card', handIndex }, catalog, defs)) {
        actions.push({ type: 'PlayCard', handIndex, target });
      }
    } else if (card.type === 'minion') {
      if (me.board.length >= MAX_BOARD) return;
      const positions = me.board.length === 0 ? [0] : [0, me.board.length];
      const targets = def?.target ? legalTargets(state, { kind: 'card', handIndex }, catalog, defs) : [];
      for (const boardIndex of positions) {
        if (targets.length === 0) actions.push({ type: 'PlayCard', handIndex, boardIndex });
        for (const target of targets) actions.push({ type: 'PlayCard', handIndex, boardIndex, target });
      }
    }
  });

  for (const m of me.board) {
    if (cantAttack(m, state.turn)) continue;
    for (const target of legalTargets(state, { kind: 'attack', attackerId: m.instanceId })) {
      actions.push({ type: 'Attack', attackerId: m.instanceId, target });
    }
  }
  return actions;
};

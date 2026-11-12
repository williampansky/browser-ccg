import type { CardCatalog } from '../cards/types';
import { needsBehaviour } from '../decks';
import { getCardDef } from '../definitions';
import type { DefLookup } from '../definitions/define-card';
import { Action, GameState, MAX_BOARD, PlayerId } from '../state/types';
import { effectiveCost } from './cost';
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
    if (!card || effectiveCost(state, player, card, catalog, defs) > me.energy.current) return;
    const def = defs(card);
    if (!def && needsBehaviour(card)) return;
    if (card.type === 'spell' || card.type === 'item') {
      if (!def) return;
      // A "choose one" card is offered once per option (and per target that option allows).
      const options = def.choices
        ? def.choices.map((c, choice) => ({ choice, needsTarget: !!c.target }))
        : [{ choice: undefined, needsTarget: !!def.target }];
      for (const { choice, needsTarget } of options) {
        const base: Action = choice === undefined ? { type: 'PlayCard', handIndex } : { type: 'PlayCard', handIndex, choice };
        if (!needsTarget) {
          actions.push(base);
          continue;
        }
        for (const target of legalTargets(state, { kind: 'card', handIndex, choice }, catalog, defs)) {
          actions.push({ ...base, target });
        }
      }
    } else if (card.type === 'weapon') {
      actions.push({ type: 'PlayCard', handIndex });
    } else if (card.type === 'minion') {
      if (me.board.length >= MAX_BOARD) return;
      const positions = me.board.length === 0 ? [0] : [0, me.board.length];
      // A "choose one" minion is offered once per option; an option whose target has no legal choice is played without one.
      const options = def?.choices
        ? def.choices.map((c, choice) => ({ choice, needsTarget: !!c.target }))
        : [{ choice: undefined, needsTarget: !!def?.target }];
      for (const { choice, needsTarget } of options) {
        const targets = needsTarget ? legalTargets(state, { kind: 'card', handIndex, choice }, catalog, defs) : [];
        for (const boardIndex of positions) {
          const base: Action =
            choice === undefined ? { type: 'PlayCard', handIndex, boardIndex } : { type: 'PlayCard', handIndex, boardIndex, choice };
          if (targets.length === 0) actions.push(base);
          for (const target of targets) actions.push({ ...base, target });
        }
      }
    }
  });

  if (me.weapon && me.weapon.attack >= 1 && me.weaponAttacksThisTurn < 1 && me.heroDisabledOnTurn !== state.turn) {
    for (const target of legalTargets(state, { kind: 'weapon' })) actions.push({ type: 'WeaponAttack', target });
  }

  for (const m of me.board) {
    if (cantAttack(m, state.turn)) continue;
    for (const target of legalTargets(state, { kind: 'attack', attackerId: m.instanceId })) {
      actions.push({ type: 'Attack', attackerId: m.instanceId, target });
    }
  }
  return actions;
};

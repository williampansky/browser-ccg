import { produce } from 'immer';
import type { Rng } from '../rng';
import { Action, ActionError, GameEvent, GameState, PlayerId } from '../state/types';
import { startTurn } from './turn';
import { checkWin } from './win';

export interface ActionResult {
  state: GameState;
  events: GameEvent[];
}

/**
 * Applies an action by the active player. Never mutates `state`.
 * Returns the new state and the events that happened, or a typed error.
 */
export const applyAction = (state: GameState, action: Action, _rng: Rng): ActionResult | ActionError => {
  if (state.status === 'over') return { error: 'GAME_OVER' };
  const events: GameEvent[] = [];
  const me = state.activePlayer;
  const opponent: PlayerId = me === '0' ? '1' : '0';

  switch (action.type) {
    case 'EndTurn':
      return { state: startTurn(state, opponent, events), events };
    case 'Concede':
      return {
        state: produce(state, (g) => {
          g.players[me].health = 0;
          checkWin(g, events);
        }),
        events,
      };
  }
};

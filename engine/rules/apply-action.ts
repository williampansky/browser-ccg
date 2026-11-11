import { produce } from 'immer';
import type { CardCatalog } from '../cards/types';
import type { Rng } from '../rng';
import { Action, ActionError, GameEvent, GameState, PlayerId } from '../state/types';
import { attack } from './attack';
import { playCard } from './play-card';
import { startTurn } from './turn';
import { checkWin } from './win';

export interface ActionResult {
  state: GameState;
  events: GameEvent[];
}

/** What the engine needs besides the state: randomness and the read-only card catalog. */
export interface EngineContext {
  rng: Rng;
  catalog: CardCatalog;
}

const isError = (r: GameState | ActionError): r is ActionError => 'error' in r;

/**
 * Applies an action by the active player. Never mutates `state`.
 * Returns the new state and the events that happened, or a typed error.
 */
export const applyAction = (state: GameState, action: Action, ctx: EngineContext): ActionResult | ActionError => {
  if (state.status === 'over') return { error: 'GAME_OVER' };
  const events: GameEvent[] = [];
  const me = state.activePlayer;
  const opponent: PlayerId = me === '0' ? '1' : '0';

  const finish = (r: GameState | ActionError): ActionResult | ActionError =>
    isError(r) ? r : { state: r, events };

  switch (action.type) {
    case 'EndTurn':
      return finish(startTurn(state, opponent, events));
    case 'Concede':
      return finish(
        produce(state, (g) => {
          g.players[me].health = 0;
          checkWin(g, events);
        })
      );
    case 'PlayCard':
      return finish(playCard(state, action, ctx.catalog, events));
    case 'Attack':
      return finish(attack(state, action, events));
  }
};

import { produce } from 'immer';
import type { CardCatalog } from '../cards/types';
import type { DefLookup } from '../definitions/define-card';
import type { Rng } from '../rng';
import { Action, ActionError, GameEvent, GameState, PlayerId } from '../state/types';
import { attack } from './attack';
import { playCard } from './play-card';
import { settle, TriggerLoopError } from './settle';
import { useHeroSkill } from './hero-skill';
import { endTurnCleanup, startTurn } from './turn';
import { weaponAttack } from './weapon-attack';

export interface ActionResult {
  state: GameState;
  events: GameEvent[];
}

/** What the engine needs besides the state: randomness, the read-only card catalog, card behaviour. */
export interface EngineContext {
  rng: Rng;
  catalog: CardCatalog;
  /** Where card behaviour comes from. Defaults to the real registry; tests inject their own. */
  defs?: DefLookup;
}

const isError = (r: GameState | ActionError): r is ActionError => 'error' in r;

/**
 * Applies an action by the active player. Never mutates `state`.
 * Returns the new state and the events that happened, or a typed error. After the action itself,
 * the game is settled: deaths removed, death effects and triggers run, game over checked.
 */
export const applyAction = (state: GameState, action: Action, ctx: EngineContext): ActionResult | ActionError => {
  if (state.status === 'over') return { error: 'GAME_OVER' };
  const events: GameEvent[] = [];
  const me = state.activePlayer;
  const opponent: PlayerId = me === '0' ? '1' : '0';

  const settled = (s: GameState, from: number): GameState =>
    produce(s, (g) => settle(g, ctx, events, from));

  try {
    switch (action.type) {
      case 'EndTurn': {
        // Two phases, so end-of-turn effects happen before the next turn begins.
        const from = events.length;
        events.push({ type: 'TurnEnded', player: me });
        const ended = settled(state, from);
        if (ended.status === 'over') return { state: ended, events };
        const next = events.length;
        const cleaned = produce(ended, (g) => endTurnCleanup(g, me));
        return { state: settled(startTurn(cleaned, opponent, events), next), events };
      }
      case 'Concede':
        return {
          state: settled(
            produce(state, (g) => {
              g.players[me].health = 0;
            }),
            0
          ),
          events,
        };
      case 'PlayCard':
      case 'Attack':
      case 'WeaponAttack':
      case 'HeroSkill': {
        const r =
          action.type === 'PlayCard'
            ? playCard(state, action, ctx, events)
            : action.type === 'Attack'
            ? attack(state, action, events, ctx)
            : action.type === 'HeroSkill'
            ? useHeroSkill(state, action, ctx, events)
            : weaponAttack(state, action, events, ctx);
        return isError(r) ? r : { state: settled(r, 0), events };
      }
    }
  } catch (e) {
    if (e instanceof TriggerLoopError) return { error: 'TRIGGER_LOOP' };
    throw e;
  }
};

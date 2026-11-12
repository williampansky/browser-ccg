import type { CardCatalog } from '../cards/types';
import type { DefLookup } from '../definitions/define-card';
import type { Rng } from '../rng';
import { createSeededRng } from '../rng';
import { applyAction } from '../rules/apply-action';
import { legalActions } from '../rules/legal-actions';
import type { Action, GameState, MinionInstance, PlayerId, PlayerState } from '../state/types';
import { isBadPlay } from './common';

/** The numbers the bot's judgement is built from. Tuned with `npm run sim` (see `engine/sim/`). */
export interface GreedyWeights {
  /** What one card in hand is worth, in "stat points" (a minion's attack + health, roughly) */
  card: number;
  /** Value of each of the first 8 health points (including armor), then of points 9 to 15, then above 15 */
  lifeLow: number;
  lifeMid: number;
  lifeHigh: number;
  guard: number;
  bubble: number;
  /** Per unit of weapon attack times durability */
  weapon: number;
  /** A face-down Mystery waiting to fire (more than the card in hand it came from, which is worth `card`) */
  mystery: number;
  /** Each energy locked by Overcharge next turn */
  overcharge: number;
}

export const DEFAULT_WEIGHTS: GreedyWeights = { card: 1.5, lifeLow: 2, lifeMid: 1, lifeHigh: 0.5, guard: 1.5, bubble: 1.5, weapon: 0.8, mystery: 3, overcharge: 1.5 };

/** An action must beat standing still by this much, or the bot ends its turn instead. */
const MIN_GAIN = 0.01;

const lifeValue = (hp: number, w: GreedyWeights): number => {
  const low = Math.max(0, Math.min(hp, 8));
  const mid = Math.max(0, Math.min(hp, 15) - 8);
  const high = Math.max(0, hp - 15);
  return low * w.lifeLow + mid * w.lifeMid + high * w.lifeHigh;
};

const minionValue = (m: MinionInstance, w: GreedyWeights): number => {
  const k = m.keywords;
  let v = (k.noAttack ? 0 : m.attack) + m.health;
  if (k.guard) v += w.guard;
  if (k.bubble) v += w.bubble;
  if (k.doubleAttack) v += m.attack * 0.7;
  if (k.rush) v += 0.5;
  return v;
};

const sideValue = (p: PlayerState, w: GreedyWeights): number => {
  const weapon = p.weapon ? p.weapon.attack * p.weapon.durability * w.weapon : 0;
  return (
    lifeValue(p.health + p.armor, w) +
    p.board.reduce((sum, m) => sum + minionValue(m, w), 0) +
    p.hand.length * w.card +
    weapon +
    (p.mystery ? w.mystery : 0) -
    (p.overcharge ?? 0) * w.overcharge
  );
};

const WIN = 1e6;

/** How good `state` looks for `me`: their side's value minus the opponent's. Winning or losing outweighs everything. */
export const evaluate = (state: GameState, me: PlayerId, w: GreedyWeights = DEFAULT_WEIGHTS): number => {
  if (state.status === 'over') return state.winner === me ? WIN : state.winner === 'draw' ? 0 : -WIN;
  const foe: PlayerId = me === '0' ? '1' : '0';
  return sideValue(state.players[me], w) - sideValue(state.players[foe], w);
};

/**
 * A one-move lookahead opponent. It tries every legal action on a copy of the game, scores the result with
 * `evaluate`, and picks the best, or ends the turn once nothing improves its position. It skips the same
 * pointless plays as the random bot (`isBadPlay`) and always swings a temporary weapon (it is lost at end of
 * turn). It can not see what the opponent will do next or what is in their hand. Ties are broken with `rng`.
 * Call it repeatedly until it returns `EndTurn`.
 */
export const chooseGreedyActionWith = (
  w: GreedyWeights,
  state: GameState,
  catalog: CardCatalog,
  rng: Rng,
  defs?: DefLookup
): Action => {
  const me = state.activePlayer;
  const actions = legalActions(state, me, catalog, defs);
  const score = (a: Action): number => {
    const r = applyAction(state, a, { rng: createSeededRng(1), catalog, defs });
    return 'error' in r ? -Infinity : evaluate(r.state, me, w);
  };
  const best = (list: Action[], floor: number): Action | undefined => {
    let top = floor;
    let picks: Action[] = [];
    for (const a of list) {
      const s = score(a);
      if (s > top + 1e-9) [top, picks] = [s, [a]];
      else if (s > floor && Math.abs(s - top) <= 1e-9) picks.push(a);
    }
    return picks.length > 0 ? rng.pick(picks) : undefined;
  };

  if (state.players[me].weapon?.temporary) {
    const swing = best(actions.filter((a) => a.type === 'WeaponAttack'), -Infinity);
    if (swing) return swing;
  }
  const moves = actions.filter((a) => a.type !== 'EndTurn' && !isBadPlay(state, a, catalog, defs));
  return best(moves, evaluate(state, me, w) + MIN_GAIN) ?? { type: 'EndTurn' };
};

/** The bot with the default weights. */
export const chooseGreedyAction = (state: GameState, catalog: CardCatalog, rng: Rng, defs?: DefLookup): Action =>
  chooseGreedyActionWith(DEFAULT_WEIGHTS, state, catalog, rng, defs);

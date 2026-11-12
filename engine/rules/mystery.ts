import type { Draft } from 'immer';
import { getCardDef } from '../definitions';
import type { DefLookup, MysteryCheck } from '../definitions/define-card';
import type { EngineContext } from './apply-action';
import { opponentOf } from './lookup';
import type { EffectContext } from '../effects/types';
import type { GameEvent, GameState, PlayerId } from '../state/types';

type Reaction = Pick<MysteryCheck, 'event' | 'attack' | 'cast'>;

/**
 * Lets `owner`'s Mystery react, if it matches `kind` and its condition holds. A Mystery only reacts on the OPPONENT's turn, and
 * then it is spent (a `MysteryRevealed` event). Effects run as the owner's; `attack` / `cast` in the context can be changed by
 * them to redirect what is about to happen. Returns whether it fired. Call inside `produce`.
 */
const react = (
  g: Draft<GameState>,
  ctx: EngineContext,
  events: GameEvent[],
  owner: PlayerId,
  match: (def: NonNullable<ReturnType<DefLookup>>['mystery'] & object) => boolean,
  reaction: Reaction,
  fx: Partial<EffectContext> = {}
): boolean => {
  const my = g.players[owner].mystery;
  if (!my || g.activePlayer === owner) return false;
  const defs = ctx.defs ?? getCardDef;
  const card = ctx.catalog.get(my.cardId);
  const def = card && defs(card)?.mystery;
  if (!def || !match(def)) return false;
  if (!def.when({ state: g as GameState, catalog: ctx.catalog, owner, ...reaction })) return false;
  g.players[owner].mystery = null;
  events.push({ type: 'MysteryRevealed', player: owner, cardId: my.cardId });
  for (const effect of def.do) {
    effect({ g, caster: owner, rng: ctx.rng, catalog: ctx.catalog, events, sourceCardId: my.cardId, ...reaction, ...fx });
  }
  return true;
};

/** An enemy attack is about to happen: the defender's Mystery may react and redirect it. Returns the (possibly new) target. */
export const mysteryBeforeAttack = (
  g: Draft<GameState>,
  ctx: EngineContext,
  events: GameEvent[],
  attack: NonNullable<EffectContext['attack']>
): NonNullable<EffectContext['attack']>['target'] => {
  const owner = opponentOf(attack.attackerPlayer);
  const info = { ...attack };
  react(g, ctx, events, owner, (d) => d.hook === 'attack', { attack: info }, { attack: info });
  return info.target;
};

/** A spell is about to resolve: the caster's opponent's Mystery may react and redirect it. Returns the (possibly new) target. */
export const mysteryBeforeSpell = (
  g: Draft<GameState>,
  ctx: EngineContext,
  events: GameEvent[],
  cast: NonNullable<EffectContext['cast']>
): NonNullable<EffectContext['cast']>['target'] => {
  const owner = opponentOf(cast.caster);
  const info = { ...cast };
  react(g, ctx, events, owner, (d) => d.hook === 'spell', { cast: info }, { cast: info });
  return info.target;
};

/** After an event: every Mystery waiting on that event type may react (called by `settle`). */
export const mysteriesOnEvent = (g: Draft<GameState>, ctx: EngineContext, events: GameEvent[], event: GameEvent): void => {
  for (const owner of ['0', '1'] as PlayerId[]) {
    react(g, ctx, events, owner, (d) => d.event === event.type, { event }, { event });
  }
};

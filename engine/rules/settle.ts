import type { Draft } from 'immer';
import { getCardDef } from '../definitions';
import type { DefLookup } from '../definitions/define-card';
import type { EngineContext } from './apply-action';
import { GameEvent, GameState, MinionInstance, PlayerId } from '../state/types';
import { recomputeAuras } from './auras';
import { cardPool } from './card-pool';
import { minionDef } from './minion';
import { summonMinion } from './summon';
import { mysteriesOnEvent } from './mystery';
import { checkWin } from './win';

/** Thrown when effects keep triggering each other without end; `applyAction` turns it into an error. */
export class TriggerLoopError extends Error {
  constructor() {
    super('trigger loop');
  }
}

const MAX_STEPS = 1000;

const boardsInPlayOrder = (g: GameState): { owner: PlayerId; minion: MinionInstance }[] =>
  (['0', '1'] as PlayerId[])
    .flatMap((owner) => g.players[owner].board.map((minion) => ({ owner, minion })))
    .sort((a, b) => a.minion.playSeq - b.minion.playSeq);

/**
 * Settles the game after an action: repeat until nothing changes.
 *  1. Remove every minion at 0 health, in play order (RULES Q15), emit `MinionDied`, then run their
 *     death effects (also in play order).
 *  2. Otherwise take the next unprocessed event and run every matching trigger of minions on the
 *     board, in play order.
 * Finally check for game over. `from` is the index of the first event this call should react to.
 * Call inside `produce`.
 */
export const settle = (g: Draft<GameState>, ctx: EngineContext, events: GameEvent[], from = 0): void => {
  const defs: DefLookup = ctx.defs ?? getCardDef;
  let cursor = from;
  for (let steps = 0; ; steps++) {
    if (steps > MAX_STEPS) throw new TriggerLoopError();
    recomputeAuras(g, ctx.catalog, defs);

    // Ring of the Lucii: this turn, a damaged minion of that player's cannot be reduced below 1 Health.
    for (const owner of ['0', '1'] as PlayerId[]) {
      if (g.players[owner].healthFloorOnTurn !== g.turn) continue;
      for (const m of g.players[owner].board) if (m.health <= 0) m.health = 1;
    }
    const dead = boardsInPlayOrder(g).filter((x) => x.minion.health <= 0);
    if (dead.length > 0) {
      g.deaths = (g.deaths ?? 0) + dead.length;
      for (const { owner } of dead) {
        g.players[owner].board = g.players[owner].board.filter((m) => m.health > 0);
      }
      for (const { owner, minion } of dead) {
        events.push({ type: 'MinionDied', player: owner, instanceId: minion.instanceId, cardId: minion.cardId });
      }
      for (const { owner, minion } of dead) {
        const def = minionDef(minion, ctx.catalog, defs);
        for (const effect of def?.onDeath ?? []) {
          effect({ g, caster: owner, self: minion.instanceId, rng: ctx.rng, catalog: ctx.catalog, events, sourceCardId: minion.cardId });
        }
        // Demises given by a spell (Haranna's Curse): a random minion of that race and cost, for the owner.
        for (const ds of minion.deathSummons ?? []) {
          const pool = cardPool(ctx.catalog, (c) => c.type === 'minion' && c.race === ds.race && c.cost === ds.cost, defs);
          if (pool.length > 0) summonMinion(g, owner, pool[ctx.rng.int(pool.length)], events);
        }
      }
      continue;
    }

    if (cursor < events.length) {
      const event = events[cursor++];
      mysteriesOnEvent(g, ctx, events, event);
      for (const { owner, minion } of boardsInPlayOrder(g)) {
        const def = minionDef(minion, ctx.catalog, defs);
        for (const trigger of def?.triggers ?? []) {
          if (trigger.event !== event.type) continue;
          if (trigger.when && !trigger.when(event, { state: g, catalog: ctx.catalog, owner, selfId: minion.instanceId })) continue;
          for (const effect of trigger.do) {
            effect({ g, caster: owner, self: minion.instanceId, event, rng: ctx.rng, catalog: ctx.catalog, events, sourceCardId: minion.cardId });
          }
        }
      }
      continue;
    }
    break;
  }
  checkWin(g, events);
};

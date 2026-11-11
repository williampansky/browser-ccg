import { opponentOf } from '../rules/lookup';
import type { Selector } from './types';

/** The target the player picked when casting. */
export const chosenTarget = (): Selector => (ctx) => (ctx.target ? [ctx.target] : []);

export const enemyHero = (): Selector => (ctx) => [{ kind: 'hero', player: opponentOf(ctx.caster) }];

export const allEnemyMinions = (): Selector => (ctx) =>
  ctx.g.players[opponentOf(ctx.caster)].board.map((m) => ({ kind: 'minion', instanceId: m.instanceId }));

/**
 * Up to `count` distinct enemies (minions and the hero), chosen at random. If there are fewer
 * enemies than `count`, all of them. Picks are made up front, so damage lands at the same time.
 */
export const randomEnemies =
  (count: number): Selector =>
  (ctx) => {
    const candidates = [...enemyHero()(ctx), ...allEnemyMinions()(ctx)].filter(
      (t) => t.kind === 'hero' || !ctx.g.players[opponentOf(ctx.caster)].board.find((m) => m.instanceId === t.instanceId)?.keywords.hidden
    );
    return ctx.rng.shuffle(candidates).slice(0, count);
  };

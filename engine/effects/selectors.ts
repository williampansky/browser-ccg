import { opponentOf } from '../rules/lookup';
import type { TargetRef } from '../state/types';
import type { Selector } from './types';

/** The target the player picked when casting. */
export const chosenTarget = (): Selector => (ctx) => (ctx.target ? [ctx.target] : []);

/** Every minion on both boards. */
export const allMinions = (): Selector => (ctx) =>
  (['0', '1'] as const).flatMap((p) =>
    ctx.g.players[p].board.map((m): TargetRef => ({ kind: 'minion', instanceId: m.instanceId }))
  );

/** The minion this effect belongs to (a warcry's own minion, or a trigger's owner minion). */
export const self = (): Selector => (ctx) => (ctx.self !== undefined ? [{ kind: 'minion', instanceId: ctx.self }] : []);

/** Who the triggering event was aimed at (an attack's victim, a heal's recipient). */
export const eventTarget = (): Selector => (ctx) => {
  const e = ctx.event;
  return e && (e.type === 'MinionAttacked' || e.type === 'Healed') ? [e.target] : [];
};

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

import { opponentOf } from '../rules/lookup';
import type { MinionInstance, TargetRef } from '../state/types';
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

const minionRef = (m: { instanceId: number }): TargetRef => ({ kind: 'minion', instanceId: m.instanceId });

/** The caster's own hero. */
export const ownHero = (): Selector => (ctx) => [{ kind: 'hero', player: ctx.caster }];

/** All of the caster's minions (a warcry's own minion included). */
export const friendlyMinions = (): Selector => (ctx) => ctx.g.players[ctx.caster].board.map(minionRef);

/** The caster's minions except the one this effect belongs to. */
export const otherFriendlyMinions = (): Selector => (ctx) =>
  ctx.g.players[ctx.caster].board.filter((m) => m.instanceId !== ctx.self).map(minionRef);

/** The caster's hero and all their minions. */
export const allFriendlies = (): Selector => (ctx) => [...ownHero()(ctx), ...friendlyMinions()(ctx)];

/** The enemy hero and all enemy minions (hidden ones too: area effects still hit them, RULES Q19). */
export const allEnemies = (): Selector => (ctx) => [...enemyHero()(ctx), ...allEnemyMinions()(ctx)];

/** Every enemy character except the one the player chose. */
export const otherEnemies = (): Selector => (ctx) =>
  allEnemies()(ctx).filter(
    (t) =>
      !(
        ctx.target &&
        (t.kind === 'hero'
          ? ctx.target.kind === 'hero' && ctx.target.player === t.player
          : ctx.target.kind === 'minion' && ctx.target.instanceId === t.instanceId)
      )
  );

/** Both heroes and every minion. */
export const everyone = (): Selector => (ctx) => [
  { kind: 'hero', player: '0' },
  { kind: 'hero', player: '1' },
  ...allMinions()(ctx),
];

/** Everyone except the minion this effect belongs to. */
export const everyoneElse = (): Selector => (ctx) =>
  everyone()(ctx).filter((t) => !(t.kind === 'minion' && t.instanceId === ctx.self));

/** Up to `count` distinct visible enemy minions, at random (never the hero). */
export const randomEnemyMinions =
  (count: number): Selector =>
  (ctx) =>
    ctx.rng.shuffle(allEnemyMinions()(ctx).filter((t) => t.kind === 'minion' && !isHidden(ctx, t.instanceId))).slice(0, count);

const isHidden = (ctx: Parameters<Selector>[0], id: number): boolean =>
  !!ctx.g.players[opponentOf(ctx.caster)].board.find((m) => m.instanceId === id)?.keywords.hidden;

/** Up to `count` distinct minions of the caster's, at random. `where` narrows who can be picked (the minion this effect belongs to is allowed). */
export const randomFriendlyMinions =
  (count: number, where: (m: MinionInstance) => boolean = () => true): Selector =>
  (ctx) =>
    ctx.rng
      .shuffle(ctx.g.players[ctx.caster].board.filter((m) => where(m as MinionInstance)))
      .slice(0, count)
      .map(minionRef);

/** The minions standing next to the one this effect belongs to, on its own side. */
export const adjacentToSelf = (): Selector => (ctx) => {
  const board = ctx.g.players[ctx.caster].board;
  const i = board.findIndex((m) => m.instanceId === ctx.self);
  return i < 0 ? [] : board.filter((_, j) => Math.abs(j - i) === 1).map(minionRef);
};

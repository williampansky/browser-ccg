import { damageTarget, healTarget } from '../rules/damage';
import { drawCard } from '../rules/draw';
import { findMinion } from '../rules/lookup';
import { summonMinion } from '../rules/summon';
import type { MinionKeywords } from '../state/types';
import type { Effect, Selector } from './types';

/** Deals `amount` damage to everything the selector picks. */
export const damage =
  (select: Selector, amount: number): Effect =>
  (ctx) => {
    for (const t of select(ctx)) damageTarget(ctx.g, t, amount, ctx.events);
  };

/** Restores up to `amount` health (never above the maximum). */
export const heal =
  (select: Selector, amount: number): Effect =>
  (ctx) => {
    for (const t of select(ctx)) healTarget(ctx.g, t, amount, ctx.events);
  };

/** The caster draws `count` cards (full hand burns, empty deck is fatigue). */
export const draw =
  (count: number): Effect =>
  (ctx) => {
    for (let i = 0; i < count; i++) drawCard(ctx.g, ctx.caster, ctx.events);
  };

/** Adds energy for this turn only. May exceed the total; the refill at next turn start resets it. */
export const gainEnergy =
  (amount: number): Effect =>
  (ctx) => {
    ctx.g.players[ctx.caster].energy.current += amount;
    ctx.events.push({ type: 'EnergyGained', player: ctx.caster, amount });
  };

/** Finds the live (draft) minion a target refers to; heroes and missing minions give nothing. */
const minionsOf = (ctx: Parameters<Effect>[0], select: Selector) =>
  select(ctx).flatMap((t) => {
    if (t.kind !== 'minion') return [];
    const found = findMinion(ctx.g, t.instanceId);
    return found ? [found] : [];
  });

/** Gives minions a keyword (Bubble, double attack, ...). */
export const grantKeyword =
  (select: Selector, keyword: keyof MinionKeywords): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) minion.keywords[keyword] = true;
  };

/** Disable: the minion cannot attack during its owner's next turn (RULES Q17). */
export const disable =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { owner, minion } of minionsOf(ctx, select)) {
      // Turns alternate, so the owner's next turn is the next turn, or the one after if it is theirs now.
      minion.disabledOnTurn = ctx.g.activePlayer === owner ? ctx.g.turn + 2 : ctx.g.turn + 1;
    }
  };

/** Expiration: the minion dies at the start of the caster's next turn (RULES Q18, provisional). */
export const expire =
  (select: Selector): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.expiresOnTurn = ctx.g.activePlayer === ctx.caster ? ctx.g.turn + 2 : ctx.g.turn + 1;
    }
  };

/** Summons the `index`-th token from the running card's entourage list (full board: nothing happens). */
export const summonEntourage =
  (index = 0): Effect =>
  (ctx) => {
    const source = ctx.sourceCardId ? ctx.catalog.get(ctx.sourceCardId) : undefined;
    const token = source && ctx.catalog.get(source.entourage[index]);
    if (!token) throw new Error(`${ctx.sourceCardId} has no entourage token #${index} in the catalog`);
    summonMinion(ctx.g, ctx.caster, token, ctx.events, ctx.self);
  };

/** Permanently adds attack and health (current and maximum) to minions. */
export const buff =
  (select: Selector, attack: number, health: number): Effect =>
  (ctx) => {
    for (const { minion } of minionsOf(ctx, select)) {
      minion.attack += attack;
      minion.maxHealth += health;
      minion.health += health;
    }
  };

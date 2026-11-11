import { damageTarget, healTarget } from '../rules/damage';
import { drawCard } from '../rules/draw';
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

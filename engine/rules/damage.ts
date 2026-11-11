import type { Draft } from 'immer';
import type { GameEvent, GameState, PlayerId } from '../state/types';

/** Damages a hero: armor absorbs first, health is clamped at 0. Call inside `produce`. */
export const damageHero = (g: Draft<GameState>, player: PlayerId, amount: number, events: GameEvent[]): void => {
  const p = g.players[player];
  const absorbed = Math.min(p.armor, amount);
  p.armor -= absorbed;
  p.health = Math.max(0, p.health - (amount - absorbed));
  events.push({ type: 'HeroDamaged', player, amount });
};

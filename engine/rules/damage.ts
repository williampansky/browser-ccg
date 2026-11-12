import type { Draft } from 'immer';
import { GameEvent, GameState, MAX_HEALTH, MinionInstance, PlayerId, TargetRef } from '../state/types';

/** Damages a hero: armor absorbs first, health is clamped at 0. Call inside `produce`. */
export const damageHero = (g: Draft<GameState>, player: PlayerId, amount: number, events: GameEvent[]): void => {
  const p = g.players[player];
  const absorbed = Math.min(p.armor, amount);
  p.armor -= absorbed;
  if (absorbed > 0) p.armorSpent = (p.armorSpent ?? 0) + absorbed;
  p.health = Math.max(0, p.health - (amount - absorbed));
  if (amount > 0) p.heroHurtOnTurn = g.turn;
  events.push({ type: 'HeroDamaged', player, amount });
};

/** Damages a hero or a minion. Heroes lose armor first. Call inside `produce`. */
export const damageTarget = (g: Draft<GameState>, target: TargetRef, amount: number, events: GameEvent[]): void => {
  if (target.kind === 'hero') return damageHero(g, target.player, amount, events);
  for (const player of ['0', '1'] as PlayerId[]) {
    const m = g.players[player].board.find((x) => x.instanceId === target.instanceId);
    if (m) return damageMinion(m, amount, events, player);
  }
};

/** Heals a hero (max 30) or a minion (max health). Emits `Healed` only if something was restored. */
export const healTarget = (g: Draft<GameState>, target: TargetRef, amount: number, events: GameEvent[]): void => {
  let restored = 0;
  if (target.kind === 'hero') {
    const p = g.players[target.player];
    const next = Math.min(MAX_HEALTH, p.health + amount);
    restored = next - p.health;
    p.health = next;
  } else {
    for (const player of ['0', '1'] as PlayerId[]) {
      const m = g.players[player].board.find((x) => x.instanceId === target.instanceId);
      if (m) {
        const next = Math.min(m.maxHealth, m.health + amount);
        restored = next - m.health;
        m.health = next;
      }
    }
  }
  if (restored > 0) events.push({ type: 'Healed', target, amount: restored });
};

/**
 * Damages a minion. Bubble absorbs the first hit that would do damage, from any source (RULES Q13),
 * and pops. A hit of 0 does nothing. Call inside `produce`.
 */
export const damageMinion = (m: Draft<MinionInstance>, amount: number, events: GameEvent[], owner: PlayerId): void => {
  if (amount <= 0 || m.immune) return;
  if (m.keywords.bubble) {
    m.keywords.bubble = false;
    events.push({ type: 'BubblePopped', instanceId: m.instanceId });
    return;
  }
  m.health = Math.max(0, m.health - amount);
  events.push({ type: 'MinionDamaged', player: owner, instanceId: m.instanceId, amount });
};

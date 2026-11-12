import { Draft, produce } from 'immer';
import { GameEvent, GameState, MAX_ENERGY, PlayerId } from '../state/types';
import { drawCard } from './draw';

/**
 * Ends "this turn only" effects when `player`'s turn ends: temporary Attack (on minions and weapons) is taken back
 * (never below 0) and a temporary weapon is removed. Call inside `produce`.
 */
export const endTurnCleanup = (g: Draft<GameState>, player: PlayerId): void => {
  for (const p of ['0', '1'] as const) {
    for (const m of g.players[p].board) {
      if (m.tempAttack !== 0) m.attack = Math.max(0, m.attack - m.tempAttack);
      m.tempAttack = 0;
    }
    const w = g.players[p].weapon;
    if (w?.tempAttack) {
      w.attack = Math.max(0, w.attack - w.tempAttack);
      w.tempAttack = 0;
    }
  }
  if (g.players[player].weapon?.temporary) g.players[player].weapon = null;
};

/** Starts `player`'s turn: turn +1, energy total +1 (cap 10) and refill, minions ready, then draw one card. */
export const startTurn = (state: GameState, player: PlayerId, events: GameEvent[]): GameState =>
  produce(state, (g) => {
    g.turn += 1;
    g.activePlayer = player;
    const energy = g.players[player].energy;
    energy.total = Math.min(MAX_ENERGY, energy.total + 1);
    energy.current = energy.total;
    for (const m of g.players[player].board) m.attacksThisTurn = 0;
    g.players[player].weaponAttacksThisTurn = 0;
    events.push({ type: 'TurnStarted', player, turn: g.turn });
    // Expiration: marked minions on either board are brought to 0 health now; `settle` removes them.
    for (const p of ['0', '1'] as const) {
      for (const m of g.players[p].board) if (m.expiresOnTurn !== undefined && m.expiresOnTurn <= g.turn) m.health = 0;
    }
    drawCard(g, player, events);
  });

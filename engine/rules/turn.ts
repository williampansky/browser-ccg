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
      if (m.tempHealth) {
        // "+N Health this turn only": the maximum drops back, and current Health follows but never below 1
        m.maxHealth = Math.max(1, m.maxHealth - m.tempHealth);
        m.health = Math.max(1, Math.min(m.health, m.maxHealth));
        m.tempHealth = 0;
      }
      delete m.immune;
    }
    const w = g.players[p].weapon;
    if (w?.tempAttack) {
      w.attack = Math.max(0, w.attack - w.tempAttack);
      w.tempAttack = 0;
    }
  }
  if (g.players[player].weapon?.temporary) g.players[player].weapon = null;
  // Borrowed minions go home when their loan ends (a full home board loses them).
  for (const p of ['0', '1'] as const) {
    for (const m of [...g.players[p].board]) {
      if (!m.loan || m.loan.returnOnTurn > g.turn) continue;
      const home = m.loan.from;
      g.players[p].board = g.players[p].board.filter((x) => x.instanceId !== m.instanceId);
      delete m.loan;
      if (g.players[home].board.length < 7) {
        m.attacksThisTurn = 0;
        g.players[home].board.push(m);
      }
    }
  }
};

/** Starts `player`'s turn: turn +1, energy total +1 (cap 10) and refill, minions ready, then draw one card. */
export const startTurn = (state: GameState, player: PlayerId, events: GameEvent[]): GameState =>
  produce(state, (g) => {
    g.turn += 1;
    g.activePlayer = player;
    const energy = g.players[player].energy;
    energy.total = Math.min(MAX_ENERGY, energy.total + 1);
    // Overcharge from last turn keeps that much of the refill locked.
    energy.current = Math.max(0, energy.total - (g.players[player].overcharge ?? 0));
    delete g.players[player].overcharge;
    for (const m of g.players[player].board) m.attacksThisTurn = 0;
    g.players[player].plays = { now: 0, prev: g.players[player].plays?.now ?? 0 };
    g.players[player].weaponAttacksThisTurn = 0;
    events.push({ type: 'TurnStarted', player, turn: g.turn });
    // Expiration: marked minions on either board are brought to 0 health now; `settle` removes them.
    for (const p of ['0', '1'] as const) {
      for (const m of g.players[p].board) if (m.expiresOnTurn !== undefined && m.expiresOnTurn <= g.turn) m.health = 0;
    }
    drawCard(g, player, events);
  });

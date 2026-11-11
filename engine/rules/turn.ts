import { produce } from 'immer';
import { GameEvent, GameState, MAX_ENERGY, PlayerId } from '../state/types';
import { drawCard } from './draw';
import { checkWin } from './win';

/** Starts `player`'s turn: turn +1, energy total +1 (cap 10) and refill, minions ready, then draw one card. */
export const startTurn = (state: GameState, player: PlayerId, events: GameEvent[]): GameState =>
  produce(state, (g) => {
    g.turn += 1;
    g.activePlayer = player;
    const energy = g.players[player].energy;
    energy.total = Math.min(MAX_ENERGY, energy.total + 1);
    energy.current = energy.total;
    for (const m of g.players[player].board) m.attacksThisTurn = 0;
    events.push({ type: 'TurnStarted', player, turn: g.turn });
    drawCard(g, player, events);
    checkWin(g, events);
  });

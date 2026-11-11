/** Game state. Everything here is JSON-serialisable; no UI state lives in it. */

export type PlayerId = '0' | '1';

export const MAX_HEALTH = 30;
export const MAX_ENERGY = 10;
export const MAX_HAND = 10;
export const MAX_BOARD = 7;

/** A card in a deck or hand. `cardId` points into the read-only catalog. */
export interface CardInstance {
  instanceId: number;
  cardId: string;
}

export interface PlayerState {
  health: number;
  armor: number;
  energy: { current: number; total: number };
  deck: CardInstance[];
  hand: CardInstance[];
  /** Fatigue counter: number of empty-deck draws so far (damage = the new value) */
  fatigue: number;
}

export interface GameState {
  turn: number;
  activePlayer: PlayerId;
  status: 'playing' | 'over';
  winner: PlayerId | 'draw' | null;
  players: Record<PlayerId, PlayerState>;
  /** All instance ids come from this counter, never from uuid */
  nextInstanceId: number;
}

export type Action = { type: 'EndTurn' } | { type: 'Concede' };

export type ActionErrorCode = 'GAME_OVER' | 'NOT_YOUR_TURN';
export interface ActionError {
  error: ActionErrorCode;
}

export type GameEvent =
  | { type: 'TurnStarted'; player: PlayerId; turn: number }
  | { type: 'Drew'; player: PlayerId; instanceId: number }
  | { type: 'Burned'; player: PlayerId; instanceId: number }
  | { type: 'Fatigue'; player: PlayerId; damage: number }
  | { type: 'HeroDamaged'; player: PlayerId; amount: number }
  | { type: 'GameOver'; winner: PlayerId | 'draw' };

export interface GameSetup {
  /** Card ids, in any order; shuffled at setup */
  decks: Record<PlayerId, string[]>;
  firstPlayer: PlayerId;
}

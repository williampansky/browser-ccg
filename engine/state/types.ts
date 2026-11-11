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

export interface MinionKeywords {
  guard: boolean;
  rush: boolean;
  bubble: boolean;
  doubleAttack: boolean;
  hidden: boolean;
  noAttack: boolean;
}

export interface MinionInstance {
  instanceId: number;
  cardId: string;
  attack: number;
  health: number;
  maxHealth: number;
  /** `GameState.turn` when it entered play (summoning sickness compares this to the current turn) */
  playedOnTurn: number;
  attacksThisTurn: number;
  keywords: MinionKeywords;
  /** Order of entering play (RULES Q15: dead minions are removed in this order) */
  playSeq: number;
  /** The turn number on which this minion may not attack (set by Disable) */
  disabledOnTurn?: number;
  /** The turn number at whose start this minion dies (set by Expiration) */
  expiresOnTurn?: number;
}

/** A hero's equipped weapon. `durability` drops by 1 per attack; at 0 the weapon breaks. */
export interface WeaponInstance {
  instanceId: number;
  cardId: string;
  attack: number;
  durability: number;
}

export interface PlayerState {
  health: number;
  armor: number;
  energy: { current: number; total: number };
  deck: CardInstance[];
  hand: CardInstance[];
  /** Dense array, left to right, at most MAX_BOARD */
  board: MinionInstance[];
  weapon: WeaponInstance | null;
  /** Weapon attacks made this turn (one allowed) */
  weaponAttacksThisTurn: number;
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
  /** Source of `MinionInstance.playSeq` */
  nextPlaySeq: number;
}

/** Something an attack or effect can aim at: a hero (either player's) or a minion on either board. */
export type TargetRef = { kind: 'hero'; player: PlayerId } | { kind: 'minion'; instanceId: number };

export type Action =
  | { type: 'EndTurn' }
  | { type: 'Concede' }
  | { type: 'PlayCard'; handIndex: number; boardIndex?: number; target?: TargetRef }
  | { type: 'Attack'; attackerId: number; target: TargetRef }
  | { type: 'WeaponAttack'; target: TargetRef };

export type ActionErrorCode =
  | 'GAME_OVER'
  | 'BAD_HAND_INDEX'
  | 'BAD_BOARD_INDEX'
  | 'UNKNOWN_CARD'
  | 'UNSUPPORTED_CARD'
  | 'CANT_AFFORD'
  | 'BOARD_FULL'
  | 'UNKNOWN_ATTACKER'
  | 'MINION_CANT_ATTACK'
  | 'ILLEGAL_TARGET'
  | 'NO_WEAPON'
  | 'HERO_CANT_ATTACK'
  | 'TRIGGER_LOOP';
export interface ActionError {
  error: ActionErrorCode;
}

export type GameEvent =
  | { type: 'TurnStarted'; player: PlayerId; turn: number }
  | { type: 'TurnEnded'; player: PlayerId }
  | { type: 'Drew'; player: PlayerId; instanceId: number }
  | { type: 'Burned'; player: PlayerId; instanceId: number }
  | { type: 'Fatigue'; player: PlayerId; damage: number }
  | { type: 'HeroDamaged'; player: PlayerId; amount: number }
  | { type: 'MinionPlayed'; player: PlayerId; instanceId: number; boardIndex: number }
  | { type: 'WeaponEquipped'; player: PlayerId; cardId: string }
  | { type: 'WeaponAttacked'; target: TargetRef }
  | { type: 'WeaponBroke'; player: PlayerId }
  | { type: 'ArmorGained'; player: PlayerId; amount: number }
  | { type: 'MinionAttacked'; attackerId: number; target: TargetRef }
  | { type: 'CardPlayed'; player: PlayerId; instanceId: number; cardId: string }
  | { type: 'MinionDamaged'; instanceId: number; amount: number }
  | { type: 'Discarded'; player: PlayerId; instanceId: number }
  | { type: 'Healed'; target: TargetRef; amount: number }
  | { type: 'EnergyGained'; player: PlayerId; amount: number }
  | { type: 'BubblePopped'; instanceId: number }
  | { type: 'MinionSummoned'; player: PlayerId; instanceId: number; cardId: string }
  | { type: 'MinionDied'; player: PlayerId; instanceId: number; cardId: string }
  | { type: 'GameOver'; winner: PlayerId | 'draw' };

export interface GameSetup {
  /** Card ids, in any order; shuffled at setup */
  decks: Record<PlayerId, string[]>;
  firstPlayer: PlayerId;
  /** A card added to the second player's opening hand (The Orb, `GAME_001`) */
  secondPlayerBonusCard?: string;
}

export type GameEventType = GameEvent['type'];

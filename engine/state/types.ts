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
  /** A cost change that travels with this copy of the card ("costs 1 less"); the engine never goes below 0 */
  costDelta?: number;
}

/** A face-down Mystery. The owner sees it; the opponent sees only its category (`MysteryDef.category`). */
export interface MysteryInstance {
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
  /** Attack currently added by auras (already included in `attack`; the engine recomputes it) */
  auraAttack: number;
  /** True while Rush comes from an aura rather than the card or a spell */
  auraRush: boolean;
  /** True while Onslaught (double attack) comes from the card's own condition rather than the card or a spell */
  auraDouble?: boolean;
  /** Attack added "for this turn only" (already included in `attack`; removed when the turn ends) */
  tempAttack: number;
  /** The turn number on which this minion may not attack (set by Disable) */
  disabledOnTurn?: number;
  /** The turn number at whose start this minion dies (set by Expiration) */
  expiresOnTurn?: number;
  /** Suppressed: the card's own behaviour (warcry already spent, triggers, auras, demise, ...) no longer applies */
  silenced?: boolean;
}

/** A hero's equipped weapon. `durability` drops by 1 per attack; at 0 the weapon breaks. */
export interface WeaponInstance {
  instanceId: number;
  cardId: string;
  attack: number;
  durability: number;
  /** Removed when its owner's turn ends (CORE_127) */
  temporary?: boolean;
  /** Attack added "for this turn only" (already included in `attack`; removed when the turn ends; CORE_127 on a weapon) */
  tempAttack?: number;
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
  /** The turn number on which this hero may not attack with its weapon (set by Disable, e.g. Ice Primordial) */
  heroDisabledOnTurn?: number;
  /** Overcharge: energy that stays locked at the start of this player's next turn (then cleared) */
  overcharge?: number;
  /** The turn number on which this player's hero last took damage (for "on turns your hero took damage") */
  heroHurtOnTurn?: number;
  /** The player's active Mystery (at most one), or none */
  mystery?: MysteryInstance | null;
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
  /** Ids of the cards each player has played from hand so far (for CORE_084) */
  played: Record<PlayerId, string[]>;
}

/** Something an attack or effect can aim at: a hero (either player's) or a minion on either board. */
export type TargetRef = { kind: 'hero'; player: PlayerId } | { kind: 'minion'; instanceId: number };

export type Action =
  | { type: 'EndTurn' }
  | { type: 'Concede' }
  | { type: 'PlayCard'; handIndex: number; boardIndex?: number; target?: TargetRef; choice?: number }
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
  | 'BAD_CHOICE'
  | 'MYSTERY_ACTIVE'
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
  | { type: 'MinionPlayed'; player: PlayerId; instanceId: number; boardIndex: number; target?: TargetRef }
  | { type: 'WeaponEquipped'; player: PlayerId; cardId: string }
  | { type: 'WeaponAttacked'; target: TargetRef }
  | { type: 'WeaponBroke'; player: PlayerId }
  | { type: 'ArmorGained'; player: PlayerId; amount: number }
  | { type: 'MinionAttacked'; attackerId: number; target: TargetRef }
  | { type: 'CardPlayed'; player: PlayerId; instanceId: number; cardId: string; target?: TargetRef; mystery?: boolean }
  | { type: 'MinionDamaged'; player: PlayerId; instanceId: number; amount: number }
  | { type: 'CardObtained'; player: PlayerId; instanceId: number }
  | { type: 'Discarded'; player: PlayerId; instanceId: number }
  | { type: 'Healed'; target: TargetRef; amount: number }
  | { type: 'EnergyGained'; player: PlayerId; amount: number }
  | { type: 'MysteryPlaced'; player: PlayerId }
  | { type: 'MysteryRevealed'; player: PlayerId; cardId: string }
  | { type: 'OverchargeGained'; player: PlayerId; amount: number; cardId: string }
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

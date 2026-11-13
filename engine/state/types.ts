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
  /** If this card is a minion, it enters play with Rush ("has Rush when played") */
  rushOnPlay?: boolean;
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
  /** Health added "for this turn only" (already in `health` and `maxHealth`; taken back when the turn ends, never leaving less than 1) */
  tempHealth?: number;
  /** Borrowed from `from` (Seadog Captain, Data-Mage, ...): goes back at the end of the turn numbered `returnOnTurn` */
  loan?: { from: PlayerId; returnOnTurn: number };
  /** Takes no damage until the end of the turn */
  immune?: boolean;
  /** Its owner draws a card whenever it attacks */
  drawsOnAttack?: boolean;
  /** Demise effects given by a spell: each summons a random minion of this race and exact cost for its owner */
  deathSummons?: { race: string; cost: number }[];
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

/** A player's hero and the state of its skills (RULES Appendix D). Absent when a game is set up without heroes. */
export interface HeroState {
  /** Hero key, e.g. `ZEUS` (see `engine/heroes`) */
  id: string;
  /** Own turns still to wait before each skill can be used again (0 = ready); ticks down as this player's turn starts */
  cooldowns: number[];
  /** One-use skills (no cooldown in the data) that have been used */
  spent: boolean[];
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
  /** On this turn number the player's NEXT spell costs `amount` less (Soul Lantern); used up when a spell is played */
  spellDiscount?: { turn: number; amount: number };
  /** On this turn number all of this player's spells cost 0 (Sir Jorio, on the opponent) */
  freeSpellsOnTurn?: number;
  /** On this turn number this player's minions cannot be reduced below 1 Health (Ring of the Lucii) */
  healthFloorOnTurn?: number;
  /** The turn number on which this player's next Mystery costs 0 (Vibrant Mage) */
  mysteryFreeOnTurn?: number;
  /** Cards this player has played this turn (`now`) and on their previous turn (`prev`), for "cards you played this turn and last" */
  plays?: { now: number; prev: number };
  /** Armor this player's hero has lost to damage over the whole game */
  armorSpent?: number;
  /** The turn number on which this player's hero last took damage (for "on turns your hero took damage") */
  heroHurtOnTurn?: number;
  /** The hero and its skills, if the game was set up with heroes */
  hero?: HeroState;
  /** Card ids of this player's non-token minions that have died, oldest first (for Resurrect) */
  graveyard?: string[];
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
  /** How many minions have died so far this game, either side */
  deaths?: number;
}

/** Something an attack or effect can aim at: a hero (either player's) or a minion on either board. */
export type TargetRef = { kind: 'hero'; player: PlayerId } | { kind: 'minion'; instanceId: number };

export type Action =
  | { type: 'EndTurn' }
  | { type: 'Concede' }
  | { type: 'PlayCard'; handIndex: number; boardIndex?: number; target?: TargetRef; choice?: number }
  | { type: 'Attack'; attackerId: number; target: TargetRef }
  | { type: 'WeaponAttack'; target: TargetRef }
  /** Uses one of the hero's skills (`skill` is 0, 1 or 2); `target` only for a targeted skill */
  | { type: 'HeroSkill'; skill: number; target?: TargetRef };

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
  | 'BAD_SKILL'
  | 'SKILL_UNAVAILABLE'
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
  | { type: 'HeroSkillUsed'; player: PlayerId; skill: number; target?: TargetRef }
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
  /** Each player's hero key (`ZEUS`, ...). Omit for a game without hero skills. */
  heroes?: Partial<Record<PlayerId, string>>;
}

export type GameEventType = GameEvent['type'];

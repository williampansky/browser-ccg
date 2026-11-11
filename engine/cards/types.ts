/**
 * Normalised card model for the Hearthstone-style engine.
 *
 * Raw Airtable records (`data/hs/*.json`) are turned into this shape by `loadCards`.
 * See RULES.md section 10 for the loader rules these types encode.
 */

export type CardType = 'minion' | 'spell' | 'item' | 'weapon';

/** Which raw file a card came from. Entourage cards are tokens created by other cards. */
export type CardSource = 'core' | 'prime' | 'entourage' | 'game';

export type PlayType = 'targeted' | 'global';

/**
 * The raw number fields, kept untouched (RULES.md Q23 is provisional). Effects must read
 * them through named accessors, not directly, so their meaning lives in one place.
 * Absent means "not applicable"; `0` is a real value.
 */
export interface CardNumbers {
  /** `numberPrimary`: the main amount (damage, heal, buff, draw count, ...) */
  primary?: number;
  /** `numberSecondary`: a second amount (e.g. health in a +X/+Y buff, `%NUM2%`) */
  secondary?: number;
  /** `numberRNG` (CORE) or `numberRandom` (PRIME): how many random targets */
  random?: number;
  /** `numberOvercharge`: overload amount */
  overcharge?: number;
}

export interface Card {
  /** e.g. `CORE_063`, or `CORE_057a` for an entourage token */
  id: string;
  source: CardSource;
  /** Absent on some PRIME/entourage records in the data */
  name?: string;
  type: CardType;
  cost: number;
  /** Minion attack, or weapon attack */
  attack?: number;
  /** Minion health, or weapon durability */
  health?: number;
  /** e.g. `SPRITE`, `NONE`. Minions only. */
  race?: string;
  /** e.g. `FREE`, `COMMON`, `MYTHIC` */
  rarity: string;
  /** e.g. `SET_002` */
  set: string;
  /** Mechanic symbols without the percent signs, e.g. `BULWARK`, `ON_PLAY`. */
  mechanics: string[];
  playType?: PlayType;
  /** e.g. `DAMAGE`, `BUFF`, `SUMMON` */
  playContext?: string;
  numbers: CardNumbers;
  /** Plain text with the number and glossary tokens still in it, e.g. `Deal %NUM% damage` */
  textTemplate: string;
  /** Plain text with number tokens substituted and glossary tokens replaced by display names */
  text: string;
  /** Resolved ids of the entourage (token) cards this card can create */
  entourage: string[];
  /** `true` for tokens created by other cards (not collectible, not in decks) */
  isToken: boolean;
  /** Legendary flag. Absent in the data means false. */
  elite: boolean;
  /** Absent in the data means inactive (except tokens, which have no such field and count as active). */
  active: boolean;
  collectible: boolean;
  flavor?: string;
  /** Designer note about rules edge cases; not player-facing text. */
  designNote?: string;
  targetingArrowText?: string;
  artistName?: string;
  artistUrl?: string;
}

export type CardIssueCode =
  | 'duplicate-id'
  | 'missing-field'
  | 'unknown-type'
  | 'unknown-mechanic'
  | 'bad-number'
  | 'numbers-conflict'
  | 'missing-name'
  | 'unresolved-entourage'
  | 'playtype-target-mismatch'
  | 'unknown-text-token'
  | 'text-number-missing';

export interface CardIssue {
  level: 'error' | 'warning';
  code: CardIssueCode;
  /** The card id, or `(unknown)` when the record has none */
  id: string;
  message: string;
}

/** A raw Airtable record from `data/hs/*.json`. */
export type RawCard = Record<string, unknown>;

/** A raw glossary record from `mechanics.json` or `constants.json`. */
export interface RawGlossaryEntry {
  symbol: string;
  name?: string;
  [key: string]: unknown;
}

export interface LoadCardsInput {
  core: RawCard[];
  prime: RawCard[];
  entourage: RawCard[];
  /** Cards the game itself hands out (`game.json`: The Orb). Optional. */
  game?: RawCard[];
  mechanics: RawGlossaryEntry[];
  constants: RawGlossaryEntry[];
}

export interface LoadCardsOptions {
  /** Throw a `CardDataError` if any error-level issue is found. Defaults to `true`. */
  strict?: boolean;
}

export interface LoadCardsResult {
  cards: Card[];
  byId: Map<string, Card>;
  issues: CardIssue[];
}

/** Read-only lookup of every card by id. State refers to cards only by id. */
export type CardCatalog = ReadonlyMap<string, Card>;

import {
  CardRace as CardRaceEnums,
  CardRarity as CardRarityEnums,
  CardSet as CardSetEnums,
  CardType as CardTypeEnums,
} from '../enums';

export declare type CardId = string;
export declare type CardRace =
  | CardRaceEnums.Android
  | CardRaceEnums.Creature
  | CardRaceEnums.Demon
  | CardRaceEnums.Dragon
  | CardRaceEnums.Element
  | CardRaceEnums.Idol
  | CardRaceEnums.Location
  | CardRaceEnums.None
  | CardRaceEnums.Pirate
  | CardRaceEnums.Sprite;
export declare type CardRarity =
  | CardRarityEnums.Common
  | CardRarityEnums.Free
  | CardRarityEnums.Golden
  | CardRarityEnums.Mythic
  | CardRarityEnums.Remarkable
  | CardRarityEnums.Superior;
export declare type CardSet = CardSetEnums.Core | CardSetEnums.Prime;
export declare type CardType =
  | CardTypeEnums.Card
  | CardTypeEnums.Minion
  | CardTypeEnums.Spell
  | CardTypeEnums.Weapon;

export interface CardStateBooleans {
  canBeBuffed: boolean;
  canBeDebuffed: boolean;
  canBeHealed: boolean;
  hasArmor: boolean;
  hasCostIncreased: boolean;
  hasCostReduced: boolean;
  hasHealthIncreased: boolean;
  hasHealthReduced: boolean;
  hasPowerIncreased: boolean;
  hasPowerReduced: boolean;
  hasEvent: boolean;
  hasImmunity: boolean;
  hasOnTurnEnd: boolean;
  hasOnTurnStart: boolean;
  isBooned: boolean;
  isBuffed: boolean;
  isDamaged: boolean;
  isDebuffed: boolean;
  isDestroyed: boolean;
  isDisabled: boolean;
  isHidden: boolean;
  isSilenced: boolean;
  onPlayWasTriggered: boolean;
  wasDiscarded: boolean;
  wasDiscovered: boolean;
  wasResurrected: boolean;
  wasReturned: boolean;
  wasTransferred: boolean;
  wasTransformed: boolean;
  willBeDestroyedNextTurn: boolean;
}

/**
 * Base card information from the database/API, which gets
 * converted into a Card interface via the `createCardObject` util.
 * @see createCardObject
 */
export interface CardBase {
  active?: boolean;
  artistName?: string;
  artistUrl?: string;
  collectible?: boolean;
  cost: number;
  description?: string;
  elite?: boolean;
  entourage?: string[];
  flavorText?: string;
  fpoArt?: boolean;
  health: number;
  howToEarn?: string;
  howToEarnGolden?: string;
  id: CardId;
  isEntourage?: boolean;
  isGolden?: boolean;
  key: string;
  mechanics?: string[];
  mechanicsEnabled?: boolean;
  name: string;
  numberPrimary: number;
  numberRNG: number;
  numberSecondary: number;
  playContext?: string;
  playType?: string;
  power: number;
  race: CardRace | string;
  rarity: CardRarity | string;
  set: CardSet | string;
  targetingText?: string;
  text?: string;
  type: CardType | string;
}

/**
 * Used to track a card's health changes.
 */
export interface CardHealthStream {
  /**
   * card that changed this health
   */
  blame: string;

  /**
   * adjustment to make
   */
  adjustment: number;

  /**
   * - if no previous idx, baseHealth + adjustment
   * - otherwise last idx currentHealth + this adjustment
   */
  currentHealth: number;

  /**
   * unique id of the blame target
   */
   uuid: string;
}

/**
 * Used to track a card's power changes.
 */
export interface CardPowerStream {
  /**
   * card that changed this power
   */
  blame: string;

  /**
   * adjustment to make
   */
  adjustment: number;

  /**
   * - if no previous idx, basePower + adjustment
   * - otherwise last idx currentPower + this adjustment
   */
  currentPower: number;

  /**
   * unique id of the blame target
   */
   uuid: string;
}

export interface Card {
  amount?: number;
  artist?: string;
  artistName?: string;
  artistUrl?: string;
  baseCost: number;
  baseHealth: number;
  basePower: number;
  booleans: CardStateBooleans;
  canPlay: boolean;
  collectible: boolean;
  currentCost: number;
  description?: string;
  displayPower: number;
  displayHealth: number;
  elite: boolean;
  entourage?: string[];
  flavorText?: string;
  fpoArt?: boolean;
  healthStream: CardHealthStream[];
  healthOverride?: number; // use this health instead of base or latest stream
  howToEarn?: string;
  howToEarnGolden?: string;
  id: CardId;
  imageBaseSrc?: string;
  imageFlairSrc: string;
  imagePlaceholderSrc?: string;
  isEntourage?: boolean;
  isGolden?: boolean;
  mechanics?: string[];
  mechanicsEnabled?: boolean;
  name: string;
  numberPrimary: number;
  numberRNG: number;
  numberSecondary: number;
  playContext?: string;
  playType?: string;
  powerOverride?: number; // use this power instead of base or latest stream
  powerStream: CardPowerStream[];
  race: CardRace | string;
  rarity: CardRarity | string;
  revealed: boolean;
  revealedOnTurn: number;
  set: CardSet | string;
  sounds?: Record<string, string>;
  targetingText?: string;
  text?: { __html: string };
  type: CardType | string;
  uuid: string;
  zonePowerAdjustment: number;

  /**
   * Required by `react-select`
   */
  key: string;

  /**
   * Required by `react-select`
   */
  value: string;
}

export interface Deck {
  name: string;
  cards: Card[];
  cardBack?: string;
  deckSlot?: number;
  uuid?: string;
}

export declare type Decks = Record<number, Deck>;

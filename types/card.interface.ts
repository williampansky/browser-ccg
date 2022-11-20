import { CardType as CardTypeEnums } from '../enums';

export declare type CardId = string;
export declare type CardType =
  | CardTypeEnums.Card
  | CardTypeEnums.Minion
  | CardTypeEnums.Spell
  | CardTypeEnums.Weapon;

/**
 * Base card information from the database/API, which gets
 * converted into a Card interface via the `createCardObject` util.
 * @see createCardObject
 */
export interface CardBase {
  active?: boolean;
  artistName?: string;
  artistUrl?: string;
  cost: number;
  collectible?: boolean;
  description?: string;
  elite?: boolean;
  entourage?: string[];
  flavorText?: string;
  howToEarn?: string;
  howToEarnGolden?: string;
  id: CardId;
  isEntourage?: boolean;
  isGolden?: boolean;
  key?: string;
  mechanics?: string[];
  mechanicsEnabled?: boolean;
  name: string;
  numberPrimary?: number;
  numberRNG?: number;
  numberSecondary?: number;
  playType?: string;
  power: number;
  race: string;
  rarity: string;
  set: string;
  targetingText?: string;
  text?: string;
  type: CardType | string;
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
   * if no previous idx, basePower + adjustment—otherwise last idx currentPower + this adjustment
   */
  currentPower: number;
}

export interface Card {
  artist?: string;
  artistName?: string;
  artistUrl?: string;
  baseCost: number;
  basePower: number;
  canPlay: boolean;
  collectible: boolean;
  currentCost: number;
  description?: string;
  displayPower: number;
  elite: boolean;
  entourage?: string[];
  flavorText?: string;
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
  numberPrimary?: number;
  numberRNG?: number;
  numberSecondary?: number;
  powerOverride?: number; // use this power instead of base or latest stream
  powerStream: CardPowerStream[];
  race: string;
  rarity: string;
  revealed: boolean;
  revealedOnTurn: number;
  set: string;
  sounds?: Record<string, string>;
  targetingText?: string;
  text?: { __html: string };
  type: CardType | string;
  uuid: string;
  zonePowerAdjustment: number;

  /**
   * Required by `react-select`
   */
  key?: string;
  
  /**
   * Required by `react-select`
   */
  value: string;
}

export interface Deck {
  name: string;
  cards: Card[];
  deckSlot?: number;
  uuid?: string;
}

export declare type Decks = Record<number, Deck>;

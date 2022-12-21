import {
  CardRace as CardRaceEnums,
  CardRarity as CardRarityEnums,
  CardSet as CardSetEnums,
  CardType as CardTypeEnums,
  CardMechanicsSide as CardMechanicsSideEnums,
  CardMechanicsContext as CardMechanicsContextEnums,
} from '../enums';

export declare type CardId = string;
export declare type CardMechanicsSide =
  | CardMechanicsSideEnums.Both
  | CardMechanicsSideEnums.None
  | CardMechanicsSideEnums.Player
  | CardMechanicsSideEnums.Opponent;
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
  canBeAttackedBySpell: boolean;
  canBeAttackedByWeapon: boolean;
  canBeBuffed: boolean;
  canBeDebuffed: boolean;
  canBeDestroyed: boolean;
  canBeHealed: boolean;
  eventWasTriggered: boolean;
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
  wasHealed: boolean;
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
  mechanicsContext: string;
  mechanicsSide: CardMechanicsSide | string;
  name: string;
  numberPrimary: number;
  numberRNG: number;
  numberSecondary: number;
  playType: string;
  power: number;
  race: CardRace | string;
  rarity: CardRarity | string;
  refId: string;
  set: CardSet | string;
  targetingText?: string;
  text?: string;
  type: CardType | string;
}

/**
 * Used to track a card's event activations;
 * e.g. EVENT, ON_PLAY, DEBUFF, etc...
 */
export interface CardEventStream {
  /**
   * card that activated this event
   */
  blame: string;

  /**
   * event that was made or triggered
   */
  event: string;

  /**
   * unique id of the blame target
   */
  uuid: string;
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
  destroyedOnTurn?: number;
  displayPower: number;
  displayHealth: number;
  elite: boolean;
  entourage?: string[];
  eventStream: CardEventStream[];
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
  mechanicsSide: CardMechanicsSide | string;
  name: string;
  numberPrimary: number;
  numberRNG: number;
  numberSecondary: number;
  mechanicsContext: string;
  playType: string;
  powerOverride?: number; // use this power instead of base or latest stream
  powerStream: CardPowerStream[];
  race: CardRace | string;
  rarity: CardRarity | string;
  revealed: boolean;
  revealedOnTurn: number;
  set: CardSet | string;
  sounds?: Record<string, string>;
  targetingText?: string;
  text?: string;
  type: CardType | string;
  uuid: string;
  zonePowerAdjustment: number;
  zoneCostAdjustment: number;

  /**
   * Required by `react-select`
   */
  key: string;

  /**
   * Required by `react-select`
   */
  value: string;

  /**
   * The uuid created by airtable which acts as a lookup reference
   * for the `entourage` field as it "Link(s) to another record"
   * on the airtable UI interface.
   */
  refId: string;
}

export interface Deck {
  name: string;
  cards: Card[];
  cardBack?: string;
  deckSlot?: number;
  uuid?: string;
}

export declare type Decks = Record<number, Deck>;

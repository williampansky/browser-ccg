export declare type CardId = string;

/**
 * Base card information from the database/API, which gets
 * converted into a Card interface via the `createCardObject` util.
 * @see createCardObject
 */
export interface CardBase {
  cost: number;
  description?: string;
  id: CardId;
  mechanic?: string;
  name: string;
  power: number;
  type?: 'CARD' | 'MINION' | 'SPELL' | 'WEAPON';
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
  baseCost: number;
  basePower: number;
  canPlay: boolean;
  collectible?: boolean;
  currentCost: number;
  description?: string;
  displayPower: number;
  elite?: boolean;
  entourage?: string[];
  flavorText?: string;
  howToEarn?: string;
  howToEarnGolden?: string;
  id: CardId;
  imageBaseSrc?: string;
  imageFlairSrc?: string;
  imagePlaceholderSrc?: string;
  isGolden?: boolean;
  mechanic?: string;
  mechanics?: string[];
  name: string;
  numberPrimary?: number;
  numberRNG?: number;
  numberSecondary?: number;
  powerOverride?: number; // use this power instead of base or latest stream
  powerStream: CardPowerStream[];
  race?: string;
  rarity?: string;
  revealed: boolean;
  revealedOnTurn: number;
  set?: string;
  sounds?: Record<string, string>;
  type: 'CARD' | 'MINION' | 'SPELL' | 'WEAPON';
  uuid: string;
  zonePowerAdjustment: number;
}

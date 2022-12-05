/**
 * Enum values for the `Card.race` base format
 */
export enum CardBaseRace {
  Android = '%RACE_ANDROID%',
  Creature = '%RACE_CREATURE%',
  Demon = '%RACE_DEMONIC%',
  Dragon = '%RACE_DRAGON%',
  Element = '%RACE_ELEMENT%',
  Idol = '%RACE_IDOL%',
  Location = '%RACE_LOCATION%',
  None = '%RACE_NONE%',
  Pirate = '%RACE_PIRATE%',
  Sprite = '%RACE_SPRITE%',
}

/**
 * Enum values for the `Card.race`
 */
export enum CardRace {
  Android = 'ANDROID',
  Creature = 'CREATURE',
  Demon = 'DEMONIC',
  Dragon = 'DRAGON',
  Element = 'ELEMENT',
  Idol = 'IDOL',
  Location = 'LOCATION',
  None = 'NONE',
  Pirate = 'PIRATE',
  Sprite = 'SPRITE',
}

/**
 * Enum values for the `Card.rarity` base format
 */
export enum CardBaseRarity {
  Common = '%RARITY_COMMON%',
  Free = '%RARITY_FREE%',
  Golden = '%RARITY_GOLDEN%',
  Mythic = '%RARITY_MYTHIC%',
  Remarkable = '%RARITY_REMARKABLE%',
  Superior = '%RARITY_SUPERIOR%',
}

/**
 * Enum values for the `Card.rarity`
 */
export enum CardRarity {
  Common = 'COMMON',
  Free = 'FREE',
  Golden = 'GOLDEN',
  Mythic = 'MYTHIC',
  Remarkable = 'REMARKABLE',
  Superior = 'SUPERIOR',
}

/**
 * Enum values for the `Card.set`
 */
export enum CardSet {
  Core = 'Core',
  Prime = 'Prime',
}

/**
 * Enum values for the `Card.type` base format
 */
export enum CardBaseType {
  Card = '%TYPE_CARD%',
  Minion = '%TYPE_MINION%',
  Spell = '%TYPE_SPELL%',
  Weapon = '%TYPE_WEAPON%',
}

/**
 * Enum values for the `Card.type`
 */
export enum CardType {
  Card = 'CARD',
  Minion = 'MINION',
  Spell = 'SPELL',
  Weapon = 'WEAPON',
}

/**
 * Enum values for the `Card.playType`
 */
export enum CardPlayType {
  Global = 'GLOBAL',
  Targeted = 'TARGETED',
}

/**
 * Enum values for game mechanics
 */
export enum CardMechanicsSide {
  Both = 'BOTH',
  None = 'NONE',
  Player = 'PLAYER',
  Opponent = 'OPPONENT',
}

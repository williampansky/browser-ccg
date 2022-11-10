import { v4 as uuid } from 'uuid';
import { CardType } from '../enums';
import { Card, CardBase } from '../types';

/**
 * Creates a playable `Card` object from the provided card base info.
 */
const createCardObject = (obj: CardBase): Card => {
  const { id, cost, elite, power, description, mechanic, name, rarity, set, type } =
    obj;

  return {
    id,
    baseCost: cost,
    basePower: power,
    canPlay: false,
    currentCost: cost,
    description: description,
    displayPower: power,
    mechanic,
    name: name,
    powerStream: [],
    revealed: false,
    revealedOnTurn: 0,
    rarity: rarity ? rarity : 'NONE',
    elite: elite ? elite : false,
    set: set ? set : 'CORE_002',
    type: type ? type : CardType.Card,
    // type: type ? type : 'CARD',
    uuid: uuid(),
    zonePowerAdjustment: 0,
    // imageFlairSrc: `sets/SET_002/${id}-CARD.jpg`
    imageFlairSrc: `/images/sets/${set}/${id}-CARD.jpg`,
  } as Card;
};

export default createCardObject;

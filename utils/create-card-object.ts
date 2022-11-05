import { v4 as uuid } from 'uuid';
import { CardType } from '../enums';
import { Card, CardBase } from '../types';

/**
 * Creates a playable `Card` object from the provided card base info.
 */
const createCardObject = (obj: CardBase): Card => {
  const { id, cost, power, description, mechanic, name, type } = obj;

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
    type: type ? type : CardType.Card,
    uuid: uuid(),
    zonePowerAdjustment: 0,
    imageFlairSrc: `sets/SET_002/${id}-CARD.jpg`
  } as Card;
};

export default createCardObject;

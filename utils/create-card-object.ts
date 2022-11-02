import { v4 as uuid } from 'uuid';
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
    type: type ? type : 'CARD',
    uuid: uuid(),
    zonePowerAdjustment: 0,
  } as Card;
};

export default createCardObject;

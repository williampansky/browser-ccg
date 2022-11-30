import { Ctx } from 'boardgame.io';
import { Card, CardBase, GameState } from '../types';
import createCardObject from './create-card-object';

/**
 * Creates a deck of cards filled with debugOpponentHandCardKey
 */
const createDebugDeck = (
  G: GameState,
  ctx: Ctx,
  database: CardBase[],
  debugKey: string
): Card[] => {
  let tempDeckArray: Card[] = [];

  [...Array(G.gameConfig.numerics.cardsPerDeck)].forEach(() => {
    let debugCardBase = database.find(obj => {
      return obj.key === debugKey;
    });

    const obj = createCardObject(debugCardBase!);
    tempDeckArray.push({
      ...obj,
      currentCost: 0,
      canPlay: true
    });
  });

  return tempDeckArray;
};

export default createDebugDeck;

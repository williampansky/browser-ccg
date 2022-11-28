import { Ctx } from 'boardgame.io';
import { Card, CardBase, GameState } from '../types';
import createCardObject from './create-card-object';

/**
 * Creates a random deck of cards from the provided
 * database parameter.
 */
const createRandomDeck = (
  G: GameState,
  ctx: Ctx,
  database: CardBase[]
): Card[] => {
  let tempDeckArray: Card[] = [];

  [...Array(G.gameConfig.numerics.cardsPerDeck)].forEach(() => {
    let randomCard = ctx.random!.Shuffle(database)[0];
    tempDeckArray.push(createCardObject(randomCard));
  });

  while (tempDeckArray.length !== G.gameConfig.numerics.cardsPerDeck) {
    let randomCard = ctx.random!.Shuffle(database)[0];
    if (tempDeckArray.filter(obj => obj.key).length >= 2) {
      tempDeckArray.push(createCardObject(randomCard));
    } else if (tempDeckArray.filter(obj => obj.key && obj.elite).length >= 1) {
      tempDeckArray.push(createCardObject(randomCard));
    }
  }

  return tempDeckArray;
};

export default createRandomDeck;

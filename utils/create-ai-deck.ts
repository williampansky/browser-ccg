import { Ctx } from 'boardgame.io';
import { Card, GameState } from '../types';
import createCardObject from './create-card-object';

import deckAiSprites from '../game/ai/decks/deck.ai.sprites';

/**
 * Creates a playable deck of cards out of a random AI cardBase deck
 */
const createAiDeck = (
  G: GameState,
  ctx: Ctx
): Card[] => {
  let deck: Card[] = [];

  deckAiSprites.forEach(obj => deck.push(createCardObject(obj!)))
  
  const shuffledDeck = ctx?.random?.Shuffle(deck)!;

  return shuffledDeck;
};

export default createAiDeck;

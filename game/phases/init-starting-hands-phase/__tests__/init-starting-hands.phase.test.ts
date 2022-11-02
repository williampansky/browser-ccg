import { gameConfig } from '../../../../config.app';
import { defaultState } from '../../../state';
import { mockCtx } from '../../../test-utils';
import initStartingHandsPhase from '../init-starting-hands.phase';

const { numerics: { cardsPerDeck, cardsPerStartingHand } } = gameConfig;
const startingDeckLength = Math.abs(cardsPerDeck - cardsPerStartingHand);

describe('Handles state manipulation relative to the starting hands phase', () => {
  test('Should set the player hands to gameConfig.cardsPerStartingHand', () => {
    let G = defaultState;
    initStartingHandsPhase.onBegin!(G, mockCtx());

    // check hand length
    expect(G.players['0'].cards.hand.length).toBe(cardsPerStartingHand);
    expect(G.players['1'].cards.hand.length).toBe(cardsPerStartingHand);
    
    // check matching deck length
    expect(G.players['0'].cards.deck.length).toBe(startingDeckLength);
    expect(G.players['1'].cards.deck.length).toBe(startingDeckLength);
  });
});

import { Card, GameState } from '../../../../types';
import CARD_DATABASE from '../../../data/setsCore.json';
import createCardObject from '../../../../utils/create-card-object';
import { counts } from '../../../state';

/**
 * If a card's id is set in `Config.debugConfig`, add that
 * card to player 0's hand for testing.
 */
const addDebugCardToHand = (G: GameState): void => {
  const {
    gameConfig,
    gameConfig: {
      numerics: { cardsPerHand },
      debugConfig: { debugHandCardKey }
    },
  } = G;

  if (debugHandCardKey !== '') {
    if (G.players['0'].cards.hand.length < cardsPerHand) {
      const dCardBase = CARD_DATABASE.find((c) => c.key === debugHandCardKey);
      if (dCardBase !== null && typeof dCardBase !== 'undefined') {
        const dCardObj = createCardObject(dCardBase);
        G.players['0'].cards.hand.push({
          ...dCardObj,
          canPlay: true,
          currentCost: 0
        } as Card);
  
        counts.incrementHand(G, '0');
      }
    }
  }
};

export default addDebugCardToHand;

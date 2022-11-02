import { Card, GameState } from '../../../../types';
import CARD_DATABASE from '../../../../tempCardsDatabase';
import createCardObject from '../../../../utils/create-card-object';

/**
 * If a card's id is set in `Config.debugConfig`, add that
 * card to player 0's hand for testing.
 */
const addDebugCardToHand = (G: GameState): void => {
  if (G.gameConfig.debugConfig.debugCardId !== '') {
    const DEBUG_CARD_ID = G.gameConfig.debugConfig.debugCardId;
    const dCardBase = CARD_DATABASE.find((c) => c.id === DEBUG_CARD_ID)!;
    const dCardObj = createCardObject(dCardBase);
    G.players['0'].cards.hand.push({
      ...dCardObj,
      canPlay: true,
      currentCost: 0
    } as Card);
  }
};

export default addDebugCardToHand;

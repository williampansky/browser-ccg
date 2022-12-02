import { Card, GameState, PlayerID } from '../../../../types';
import CARD_DATABASE from '../../../data/setsCore.json';
import createCardObject from '../../../../utils/create-card-object';
import { counts } from '../../../state';

/**
 * If a card's id is set in `Config.debugConfig`, add that
 * card to player 0's hand for testing.
 */
const addDebugCardToHand = (G: GameState, player?: PlayerID): void => {
  const playerid = player ? player : '0';
  const opponentid = player ? player : '1';
  const {
    gameConfig,
    gameConfig: {
      numerics: { cardsPerHand },
      debugConfig: {
        debugHandCardKey,
        useDebugHandCardKey,
        debugOpponentHandCardKey,
        useDebugOpponentHandCardKey,
      }
    },
  } = G;

  if (useDebugHandCardKey) { 
    if (G.players[playerid].cards.hand.length < cardsPerHand) {
      const dCardBase = CARD_DATABASE.find((c) => c.key === debugHandCardKey);
      if (dCardBase !== null && typeof dCardBase !== 'undefined') {
        const dCardObj = createCardObject(dCardBase);
        G.players[playerid].cards.hand.push({
          ...dCardObj,
          canPlay: true,
          currentCost: 0
        } as Card);
  
        counts.incrementHand(G, playerid);
      }
    }
  }

  if (useDebugOpponentHandCardKey) { 
    if (G.players[opponentid].cards.hand.length < cardsPerHand) {
      const dCardBase = CARD_DATABASE.find((c) => c.key === debugOpponentHandCardKey);
      if (dCardBase !== null && typeof dCardBase !== 'undefined') {
        const dCardObj = createCardObject(dCardBase);
        G.players[opponentid].cards.hand.push({
          ...dCardObj,
          canPlay: true,
          currentCost: 0
        } as Card);
  
        counts.incrementHand(G, opponentid);
      }
    }
  }
};

export default addDebugCardToHand;

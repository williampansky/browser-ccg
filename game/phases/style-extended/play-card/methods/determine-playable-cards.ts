import { gte } from 'lodash';
import { GameState, PlayerID } from '../../../../../types';

export const determinePlayableCards = (G: GameState, player: PlayerID) => {
  const { actionPoints, players } = G;
  const playerHand = players[player].cards.hand;
  const currentAP = actionPoints[player].current;

  playerHand.forEach((c) => {
    if (gte(currentAP, c.currentCost)) c.canPlay = true;
    else c.canPlay = false;
  });

  if (player === '1') {
    playerHand.forEach((c) => {
      if (c.canPlay) G.aiPossibleCards.push(c)
    });
  }
};

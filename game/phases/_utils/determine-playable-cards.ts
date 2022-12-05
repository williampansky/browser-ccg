import { Ctx } from 'boardgame.io';
import { gte, lte } from 'lodash';
import { GameState, PlayerID } from '../../../types';
import { isBotGame } from '../../../utils';

export const determinePlayableCards = (G: GameState, ctx: Ctx, player: PlayerID) => {
  const { actionPoints, gameConfig, players } = G;
  const { ai } = gameConfig;
  const playerHand = players[player].cards.hand;
  const currentAP = actionPoints[player].current;

  playerHand.forEach((c) => {
    if (lte(c.currentCost, currentAP)) {
      c.canPlay = true;
    } else {
      c.canPlay = false;
    }

    if (isBotGame(ctx) &&  player === '1' && ai.logBotAiMovesToConsole) {
      console.log(c.name, `${c.currentCost}/${currentAP}`, c.canPlay)
    }
  });

  // if (player === '1') {
  //   playerHand.forEach((c) => {
  //     if (c.canPlay) G.aiPossibleCards.push(c)
  //   });
  // }
};

import { gte, lt, lte } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../types';
import { getContextualPlayerIds, getRandomNumberBetween, noPlayableCardsAvailable } from '../utils';
import { gameConfig } from '../app.config';

const {
  debugConfig: { useDebugOpponentHandCardKey },
} = gameConfig;

const aiEnumeration = (G: GameState, ctx: Ctx, player: PlayerID) => {
  // enumerate: (G: GameState, ctx: Ctx, player: PlayerID) => {
    const { players, zones, gameConfig } = G;
    const aiID = '1';
    const perZone = gameConfig.numerics.numberOfSlotsPerZone;
    const aiPlayer = players[aiID];
    const aiDeck = aiPlayer.cards.deck;
    const aiHand = aiPlayer.cards.hand;
    const ap = G.actionPoints[aiID].current;
    
    let moves: any[] = [];

    // if (gameConfig.ai.enableBotAiMoves === false) {
    //   // pushSetDoneMove(moves, aiID);
    //   return ctx.events?.endTurn()
    //   // return moves;
    // }

    // avoids onslaught of INVALID_MOVE errors
    // prettier-ignore
    if (G.playerTurnDone[aiID] === false) {
      const cardPool = [
        ...aiDeck,
        ...aiHand
      ]

      if (noPlayableCardsAvailable(G, ctx.currentPlayer)) {
        // pushSetDoneMove(moves, ctx.currentPlayer);
        logBotAiMovesToConsole(moves, gameConfig.ai.logBotAiMovesToConsole);
        // return moves;
        return [{ move: 'aiSetDone', args: ['1'] }]
      }
      else {
        for (let i = 0; i < G.players[aiID].cards.hand.length; i++) {
          const card = G.players[aiID].cards.hand[i];
          if (card.canPlay) {
            pushPlayCardMovesV2(G, ctx, moves, aiID, card, i, 0, perZone);
            pushPlayCardMovesV2(G, ctx, moves, aiID, card, i, 1, perZone);
            pushPlayCardMovesV2(G, ctx, moves, aiID, card, i, 2, perZone);
          }
        }

        pushSetDoneMove(moves, ctx.currentPlayer);
      }
    }

    logBotAiMovesToConsole(moves, gameConfig.ai.logBotAiMovesToConsole);
    return moves;
  // },
}

export const pushPlayCardMovesV2 = (
  G: GameState,
  ctx: Ctx,
  moves: any,
  aiID: PlayerID,
  card: Card,
  cardIndex: number,
  zoneNumber: number,
  perZone: number
) => {
  const notDisabled = G.zones[zoneNumber].disabled[aiID] === false;
  const notFull = lt(G.zones[zoneNumber].sides[aiID].length, perZone);

  if (notDisabled && notFull) {
    moves.push({
      move: 'aiPlayCard',
      args: [{ aiID, zoneNumber, card, cardIndex }],
    });
  }
};

export const pushSetDoneMove = (moves: any, aiID: PlayerID) => {
  moves.push({ move: 'aiSetDone', args: [aiID] });
};

export const logBotAiMovesToConsole = (moves: any, perConfig: boolean) => {
  if (perConfig === true && moves.length !== 0) {
    console.clear();
    console.log(moves);
  }
};

export default aiEnumeration;

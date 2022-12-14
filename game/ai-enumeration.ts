import { current } from 'immer';
import { gte, lt, lte } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../types';
import { getContextualPlayerIds, getRandomNumberBetween, noPlayableCardsAvailable, noStageActive } from '../utils';
import { gameConfig } from '../app.config';
import { AiPlayCardMove } from './ai/ai.moves';

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
    
    let counter: number = 0;
    let moves: any[] = [];

    const debugPerTurn = () => {
      if (lte(G.turn, 1)) return 1;
      if (lte(G.turn, 5)) return 5;
      if (lte(G.turn, 8)) return 8;
      if (lte(G.turn, 12)) return 12;
      return 18;
    }

    if (gameConfig.ai.logBotAiMovesToConsole) {
      // console.clear();
    }

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

      G.zones.forEach(z => {
        z.sides[aiID].forEach(c => {
          if (c) counter++
        })
      })

      if (noPlayableCardsAvailable(G, ctx.currentPlayer)) {
        // pushSetDoneMove(moves, ctx.currentPlayer);
        logBotAiMovesToConsole(moves, gameConfig.ai.logBotAiMovesToConsole);
        // return moves;
        return [{ move: 'aiSetDone', args: ['1'] }]
      } else if (lt(counter, debugPerTurn())) {
        for (let i = 0; i < G.players[aiID].cards.hand.length; i++) {
          const card = G.players[aiID].cards.hand[i];
          if (card.canPlay) {
            const rngZone = getRandomNumberBetween(0, 2);
            pushPlayCardMove(G, ctx, moves, aiID, card, i, rngZone, perZone);
            // pushPlayCardMove(G, ctx, moves, aiID, card, i, 1, perZone);
            // pushPlayCardMove(G, ctx, moves, aiID, card, i, 2, perZone);
          }
        }

        if (noStageActive(ctx)) pushSetDoneMove(moves, ctx.currentPlayer);
      } else {
        pushSetDoneMove(moves, ctx.currentPlayer);
      }
    }

    logBotAiMovesToConsole(moves, gameConfig.ai.logBotAiMovesToConsole);
    return moves;
  // },
}

export const pushPlayCardMove = (
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
      args: [aiID, zoneNumber, card, cardIndex],
    });
  }
};

export const pushSetDoneMove = (moves: any, aiID: PlayerID) => {
  moves.push({ move: 'aiSetDone', args: [aiID] });
};

export const logBotAiMovesToConsole = (moves: any, perConfig: boolean) => {
  if (perConfig === true && moves.length !== 0) {
    console.log(moves);
  }
};

export default aiEnumeration;

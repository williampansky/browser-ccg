import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';

import playCardStages from './play-card.stages';
import { LastMoveMade } from '../../../enums';
import { aiPlayCard, aiSetDone, aiSetDoneMove } from '../../ai';
import { deselectCard, playCard, selectCard, setDone } from '../../moves';
import {
  determinePlayableCards,
  drawCardFromPlayersDeck,
  handleZoneDisabledForXTurns,
  handleZonePowersCalculations,
  initActivateEventListeners,
  initActiveOnTurnEndListeners,
  isBotGame,
  logPhaseToConsole,
  noPlayableCardsAvailable,
  removeDestroyedCards,
  removeLastPlayedCardFromHand,
  unsetPlayableCards,
} from '../../../utils';
import playCardTurnOnMove from './play-card.turn.on-move';
import { actionPoints } from '../../state';
import handleZoneMechanics from '../../mechanics/handle-zone-mechanics';

export default <PhaseConfig>{
  next: 'incrementTurn',
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
    handleZonePowersCalculations(G, ctx);
    removeDestroyedCards(G, ctx);
    handleZoneDisabledForXTurns(G, ctx);

    // if (isBotGame(ctx) && ctx.currentPlayer === '1') {
    //   actionPoints.incrementTotal(G, ctx.currentPlayer);
    //   actionPoints.matchTotal(G, ctx.currentPlayer);
    //   drawCardFromPlayersDeck(G, '1', 1, 'next');
    // }
  },
  onEnd(G: GameState, ctx: Ctx) {
    // unsetPlayableCards({ G, player: ctx.currentPlayer })
  },
  endIf(G: GameState, ctx: Ctx) {
    return G.playerTurnDone['0'] === true && G.playerTurnDone['1'] === true;
  },
  moves: {
    aiPlayCard,
    aiSetDone,
    deselectCard,
    playCard,
    selectCard,
    setDone,
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
    onBegin(G: GameState, ctx: Ctx) {
      determinePlayableCards(G, ctx, ctx.currentPlayer);
      handleZoneMechanics(G, ctx, 'onTurnBegin');

      if (isBotGame(ctx) && ctx.currentPlayer === '1') {
        if (G.gameConfig.ai.enableBotAiMoves === false) {
          return aiSetDoneMove(G, ctx, { aiID: '1' });
        }

        // if (noPlayableCardsAvailable(G, ctx.currentPlayer)) {
        //   return aiSetDoneMove(G, ctx, { aiID: '1' });
        // }
      }
    },
    onEnd(G: GameState, ctx: Ctx) {
      unsetPlayableCards(G, ctx.currentPlayer);
      initActiveOnTurnEndListeners(G, ctx);
      handleZoneMechanics(G, ctx, 'onTurnEnd');
    },
    endIf(G: GameState, ctx: Ctx) {
      return G.playerTurnDone[ctx.currentPlayer] === true;
    },
    onMove: playCardTurnOnMove,
    stages: playCardStages,
  },
};

import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';

import { determinePlayableCards } from '../_utils/determine-playable-cards';
import {
  drawCardFromPlayersDeck,
  isBotGame,
  logPhaseToConsole,
} from '../../../utils';
import handleZonePowersCalculations from '../_utils/handle-zone-powers-calculations';
import { unsetPlayableCards } from '../_utils/unset-playable-cards';
import determineActionPoints from '../_utils/determine-action-points';
import { lastCardPlayed } from '../../state';
import removeLastPlayedCardFromHand from '../_utils/remove-last-played-card-from-hand';
import { LastMoveMade } from '../../../enums';
import removeDestroyedCards from '../_utils/remove-destroyed-cards';
import { aiPlayCard, aiSetDone } from '../../ai';
import {
  attackMinion,
  buffMinion,
  deselectCard,
  playCard,
  selectCard,
  setDone,
} from '../_moves/_moves';
import { aiSetDoneMove } from '../../ai/ai.moves';

export default <PhaseConfig>{
  next(G, ctx) {
    if (G.turn === 1) return 'revealZone';
    if (G.turn === 2) return 'revealZone';
    else return 'incrementTurn';
  },
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
    handleZonePowersCalculations(G, ctx);
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
    onBegin(G, ctx) {
      determinePlayableCards(G, ctx, ctx.currentPlayer);

      if (isBotGame(ctx) && ctx.currentPlayer === '1') {
        if (G.gameConfig.ai.enableBotAiMoves === false) {
          return aiSetDoneMove(G, ctx, { aiID: '1' });
        }
      }
    },
    onEnd(G: GameState, ctx: Ctx) {
      unsetPlayableCards(G, ctx.currentPlayer);
    },
    endIf(G: GameState, ctx: Ctx) {
      return G.playerTurnDone[ctx.currentPlayer] === true;
    },
    onMove(G: GameState, ctx: Ctx) {
      if (G.lastMoveMade === LastMoveMade.PlayCard) {
        handleZonePowersCalculations(G, ctx);

        if (ctx.activePlayers === null) {
          removeLastPlayedCardFromHand(G, ctx.currentPlayer);
          determinePlayableCards(G, ctx, ctx.currentPlayer);
        }
      }
    },
    stages: {
      attackMinion: {
        moves: {
          deselectCard,
          attackMinion,
        },
      },
      buffMinion: {
        moves: {
          deselectCard,
          buffMinion,
        },
      },
    },
  },
};

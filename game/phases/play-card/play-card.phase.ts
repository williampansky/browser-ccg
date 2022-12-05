import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';

import { aiPlayCard } from '../../ai';
import { AiPlayCardMove, aiSetDone } from '../../ai/ai.moves';
import { deselectCard } from '../_moves/deselect-card.move';
import { determinePlayableCards } from '../_utils/determine-playable-cards';
import {
  drawCardFromPlayersDeck,
  isBotGame,
  logPhaseToConsole,
} from '../../../utils';
import { playCard } from '../_moves/play-card.move';
import { selectCard } from '../_moves/select-card.move';
import handleZonePowersCalculations from '../_utils/handle-zone-powers-calculations';
import setDoneMove from '../_moves/set-done.move';
import { unsetPlayableCards } from '../_utils/unset-playable-cards';
import determineActionPoints from '../_utils/determine-action-points';
import { lastCardPlayed } from '../../state';
import removeLastPlayedCardFromHand from '../_utils/remove-last-played-card-from-hand';
import { LastMoveMade } from '../../../enums';
import removeDestroyedCards from '../_utils/remove-destroyed-cards';

export default <PhaseConfig>{
  next(G, ctx) {
    if (G.turn === 1) return 'revealZone';
    if (G.turn === 2) return 'revealZone';
    else return 'incrementTurn';
  },
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
    handleZonePowersCalculations(G, ctx);

    if (isBotGame(ctx) && ctx.currentPlayer === '1') {
      removeDestroyedCards(G, ctx);
    }
  },
  onEnd(G: GameState, ctx: Ctx) {
    // unsetPlayableCards({ G, player: ctx.currentPlayer })
  },
  endIf(G: GameState, ctx: Ctx) {
    return G.playerTurnDone['0'] === true && G.playerTurnDone['1'] === true;
  },
  moves: {
    deselectCard: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: false,
      move: (G: GameState, ctx: Ctx) => {
        return deselectCard({ G, ctx });
      },
    },
    playCard: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: true,
      move: (G: GameState, ctx: Ctx, zoneNumber: number) => {
        return playCard({ G, ctx, zoneNumber });
      },
    },
    selectCard: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: false,
      move: (G: GameState, ctx: Ctx, cardUuid: string) => {
        return selectCard({ G, ctx, cardUuid });
      },
    },
    setDone: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: false,
      move: (G: GameState, ctx: Ctx, player: PlayerID) => {
        return setDoneMove({ G, ctx, player });
      },
    },
    aiPlayCard: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: false,
      move: (
        G: GameState,
        ctx: Ctx,
        { aiID, zoneNumber, card, cardIndex }: AiPlayCardMove
      ) => {
        return aiPlayCard(G, ctx, { aiID, zoneNumber, card, cardIndex });
      },
    },
    aiSetDone: {
      client: false,
      noLimit: true,
      ignoreStaleStateID: true,
      undoable: false,
      move: (G: GameState, ctx: Ctx, player: PlayerID) => {
        return aiSetDone(G, ctx, player);
      },
    },
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
    onBegin(G, ctx) {
      if (isBotGame(ctx) && ctx.currentPlayer === '1') {
        determineActionPoints(G, '1')
        drawCardFromPlayersDeck(G, '1');
      }
      
      determinePlayableCards(G, ctx, ctx.currentPlayer);
    },
    onEnd(G: GameState, ctx: Ctx) {
      unsetPlayableCards(G, ctx.currentPlayer);

      // if (ctx.currentPlayer === '1') {
      // drawCardFromPlayersDeck(G, ctx.playOrder.filter(n => n !== ctx.currentPlayer).pop()!)

      // }
      // ctx.events?.setPhase('removeDestroyedCards');
    },
    endIf(G: GameState, ctx: Ctx) {
      return G.playerTurnDone[ctx.currentPlayer] === true;
    },
    onMove(G: GameState, ctx: Ctx) {
      handleZonePowersCalculations(G, ctx);

      if (G.lastMoveMade === LastMoveMade.PlayCard) {
        removeLastPlayedCardFromHand(G, ctx.currentPlayer);
        determinePlayableCards(G, ctx, ctx.currentPlayer);
      } else if (G.lastMoveMade === LastMoveMade.aiPlayCard) {
        determinePlayableCards(G, ctx, '1');
      }
    },
  },
};

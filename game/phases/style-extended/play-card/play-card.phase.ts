import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../../types';

// import {
//   onTurnBeginLoop,
//   onTurnEndLoop,
//   onTurnMoveLoop,
//   resetDoneState,
//   unsetPlayableCardsInHand,
// } from './methods';

import {
  drawCardFromPlayersDeck,
  filterArray,
  getContextualPlayerIds,
  logPhaseToConsole,
} from '../../../../utils';
import { fxEnd } from '../../../config.bgio-effects';
import { playCard } from '../_moves/play-card.move';
import { selectCard } from '../_moves/select-card.move';
import { deselectCard } from '../_moves/deselect-card.move';
import { determinePlayableCards } from './methods/determine-playable-cards';
import setDoneMove from '../_moves/set-done.move';
import { unsetPlayableCards } from './methods/unset-playable-cards';
import { counts, playerTurnDone, selectedCardData, selectedCardIndex } from '../../../state';
import determineActionPoints from '../utils/determine-action-points';
import { aiPlayCard } from '../../../ai';
import { aiSetDone } from '../../../ai/ai.moves';
import removeCardFromHand from '../utils/remove-card-from-hand';
// import { moves } from './play-cards.phase.moves';

export default <PhaseConfig>{
  next(G, ctx) {
    if (G.turn === 1) return 'revealZone';
    if (G.turn === 2) return 'revealZone';
    else return 'incrementTurn';
  },
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
    // selectedCardData.reset(G, ctx.currentPlayer);
    // selectedCardIndex.reset(G, ctx.currentPlayer);
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
        aiID: PlayerID,
        zoneNumber: number,
        card: Card,
        cardIndex: number
      ) => {
        return aiPlayCard({ G, ctx, aiID, zoneNumber, card, cardIndex });
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
      determinePlayableCards(G, ctx.currentPlayer);
    },
    onEnd(G: GameState, ctx: Ctx) {
      unsetPlayableCards(G, ctx.currentPlayer);
    },
    endIf(G: GameState, ctx: Ctx) {
      return G.playerTurnDone[ctx.currentPlayer] === true;
    },
    onMove(G: GameState, ctx: Ctx) {
    },
  },
};

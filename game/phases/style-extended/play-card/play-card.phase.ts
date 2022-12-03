import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState, PlayerID } from '../../../../types';

// import {
//   onTurnBeginLoop,
//   onTurnEndLoop,
//   onTurnMoveLoop,
//   resetDoneState,
//   unsetPlayableCardsInHand,
// } from './methods';

import { logPhaseToConsole } from '../../../../utils';
import { fxEnd } from '../../../config.bgio-effects';
import { playCard } from './moves/play-card.move';
import { selectCard } from './moves/select-card.move';
import { deselectCard } from './moves/deselect-card.move';
import { determinePlayableCards } from './methods/determine-playable-cards';
// import { moves } from './play-cards.phase.moves';

export default<PhaseConfig> {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
    determinePlayableCards({ G, player: ctx.currentPlayer });
  },
  onEnd(G: GameState, ctx: Ctx) {
    // resetDoneState(G);
  },
  // endIf(G: GameState, ctx: Ctx) {
  //   return G.playerTurnDone['0'] === true;
  // },
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
  },
  // turn: {
  //   onBegin(G: GameState, ctx: Ctx) {
  //     onTurnBeginLoop(G, ctx);
  //   },
  //   onEnd(G: GameState, ctx: Ctx) {
  //     const { currentPlayer } = ctx;
  //     unsetPlayableCardsInHand(G, currentPlayer);
  //     onTurnEndLoop(G, ctx);
  //     fxEnd(ctx);
  //   },
  //   endIf(G: GameState, ctx: Ctx) {
  //     const { currentPlayer } = ctx;
  //     return G.playerTurnDone[currentPlayer] === true;
  //   },
  //   onMove(G: GameState, ctx: Ctx) {
  //     const { currentPlayer } = ctx;
  //     onTurnMoveLoop(G, ctx, currentPlayer);
  //   },
  //   order: TurnOrder.CUSTOM_FROM('turnOrder'),
  // },
};

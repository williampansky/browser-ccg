import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState } from '../../../types';

import {
  onTurnBeginLoop,
  onTurnEndLoop,
  onTurnMoveLoop,
  resetDoneState,
  unsetPlayableCardsInHand,
} from './methods';

import { logPhaseToConsole } from '../../../utils';
import { fxEnd } from '../../config.bgio-effects';
import { moves } from './play-cards.phase.moves';

const defaultPlayCardsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    fxEnd(ctx);
  },
  onEnd(G: GameState, ctx: Ctx) {
    resetDoneState(G);
  },
  endIf(G: GameState, ctx: Ctx) {
    return G.playerTurnDone['0'] === true && G.playerTurnDone['1'] === true;
  },
  moves: moves,
  turn: {
    onBegin(G: GameState, ctx: Ctx) {
      onTurnBeginLoop(G, ctx);
    },
    onEnd(G: GameState, ctx: Ctx) {
      const { currentPlayer } = ctx;
      unsetPlayableCardsInHand(G, currentPlayer);
      onTurnEndLoop(G, ctx);
      fxEnd(ctx);
    },
    endIf(G: GameState, ctx: Ctx) {
      const { currentPlayer } = ctx;
      return G.playerTurnDone[currentPlayer] === true;
    },
    onMove(G: GameState, ctx: Ctx) {
      const { currentPlayer } = ctx;
      onTurnMoveLoop(G, ctx, currentPlayer);
    },
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  },
};

export default defaultPlayCardsPhase;

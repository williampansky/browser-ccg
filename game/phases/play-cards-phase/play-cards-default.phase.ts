import { TurnOrder } from 'boardgame.io/core';
import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState } from '../../../types';
import {
  addDebugCardToHand,
  incrementActionPointsTotal,
  initZoneOnTurnStartInteractions,
  resetDoneState,
  setActionPointsToTotal,
  setPlayableCardsInHand,
  unsetPlayableCardsInHand,
} from './methods';

import { drawCardFromPlayersDeck, logPhaseToConsole } from '../../../utils';
import { moves } from './play-cards.phase.config';
const { CUSTOM_FROM } = TurnOrder;

const defaultPlayCardsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
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
      const { currentPlayer } = ctx;
      drawCardFromPlayersDeck(G, currentPlayer);
      incrementActionPointsTotal(G, currentPlayer);
      setActionPointsToTotal(G, currentPlayer);
      setPlayableCardsInHand(G, currentPlayer);
      initZoneOnTurnStartInteractions(G, currentPlayer);
      addDebugCardToHand(G, currentPlayer);
    },
    onEnd(G: GameState, ctx: Ctx) {
      unsetPlayableCardsInHand(G, ctx.currentPlayer);
    },
    endIf(G: GameState, ctx: Ctx) {
      return G.playerTurnDone[ctx.currentPlayer] === true;
    },
    order: CUSTOM_FROM('turnOrder'),
  },
};

export default defaultPlayCardsPhase;

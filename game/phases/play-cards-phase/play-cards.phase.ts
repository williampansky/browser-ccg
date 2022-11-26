import { TurnOrder } from 'boardgame.io/core';
import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState } from '../../../types';
import {
  addDebugCardToHand,
  incrementActionPointsTotal,
  initZoneOnTurnStartInteractions,
  resetDoneStateForBothPlayers,
  setActionPointsToTotal,
  setFirstRevealer,
  setPlayableCardsInHand,
  unsetPlayableCardsInHand,
  updateZoneCardsReference,
} from './methods';

import { logPhaseToConsole } from '../../../utils';
import { gameConfig } from '../../../app.config';
import {
  asyncActivePlayers,
  asyncStages,
  moves,
} from './play-cards.phase.config';

const { CUSTOM_FROM } = TurnOrder;

const { asynchronousTurns } = gameConfig;
const gameUsesAsyncTurns = asynchronousTurns === true;
const gameUsesDefaultTurns = asynchronousTurns === false;

const playCardsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);

    if (gameUsesAsyncTurns) {
      incrementActionPointsTotal(G);
      setActionPointsToTotal(G);
      setPlayableCardsInHand(G);
      initZoneOnTurnStartInteractions(G);
      resetDoneStateForBothPlayers(G);
      setFirstRevealer(G);
      updateZoneCardsReference(G);
      addDebugCardToHand(G);
    }
  },
  onEnd(G: GameState, ctx: Ctx) {
    if (gameUsesAsyncTurns) unsetPlayableCardsInHand(G);
  },
  turn: {
    onBegin(G: GameState, ctx: Ctx) {
      if (gameUsesDefaultTurns) {
        incrementActionPointsTotal(G);
        setActionPointsToTotal(G);
        setPlayableCardsInHand(G);
        initZoneOnTurnStartInteractions(G);
        addDebugCardToHand(G);
      }
    },
    onEnd(G: GameState, ctx: Ctx) {
      if (gameUsesDefaultTurns) {
        unsetPlayableCardsInHand(G);
      }
    },
    activePlayers: gameUsesAsyncTurns ? asyncActivePlayers : undefined,
    stages: gameUsesAsyncTurns ? asyncStages : undefined,
    order: gameUsesDefaultTurns ? CUSTOM_FROM('turnOrder') : undefined,
    endIf(G: GameState, ctx: Ctx) {
      return (
        gameUsesDefaultTurns &&
        G.playerTurnDone['0'] === true &&
        G.playerTurnDone['1'] === true
      );
    },
  },
  moves: gameUsesDefaultTurns ? moves : undefined,
};

export default playCardsPhase;

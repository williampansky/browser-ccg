import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState } from '../../../types';
import {
  addDebugCardToHand,
  incrementActionPointsTotal,
  initZoneOnTurnStartInteractions,
  resetDoneState,
  setActionPointsToTotal,
  setFirstRevealer,
  setPlayableCardsInHand,
  unsetPlayableCardsInHand,
  updateZoneCardsReference,
} from './methods';

import { logPhaseToConsole } from '../../../utils';
import { moves } from './play-cards.phase.config';

const asyncPlayCardsPhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);
    incrementActionPointsTotal(G);
    setActionPointsToTotal(G);
    setPlayableCardsInHand(G);
    initZoneOnTurnStartInteractions(G);
    resetDoneState(G);
    setFirstRevealer(G);
    updateZoneCardsReference(G);
    addDebugCardToHand(G);
  },
  onEnd(G: GameState, ctx: Ctx) {
    unsetPlayableCardsInHand(G);
  },
  turn: {
    activePlayers: {
      all: 'playCards',
      currentPlayer: { stage: 'playCards' },
      others: { stage: 'playCards' },
      value: {
        '0': { stage: 'playCards' },
        '1': { stage: 'playCards' },
      },
    },
    stages: {
      playCards: {
        moves: moves,
      },
    },
  },
};

export default asyncPlayCardsPhase;

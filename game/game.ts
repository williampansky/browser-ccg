import type { Ctx, Game } from 'boardgame.io';
import { EffectsPlugin } from 'bgio-effects/plugin';

import type { EffectsCtxMixin } from 'bgio-effects/dist/types';
import type { GameState, PlayerID } from '../types';

import {
  drawCardPhase,
  handleZonePowerCalculationsPhase,
  incrementGameTurnPhase,
  initCardMechanicsPhase,
  initPlayersPhase,
  initStartingHandsPhase,
  initZoneInteractionsPhase,
  initZonesPhase,
  playCardsPhase,
  revealCardsFaceDownPhase,
  revealCardsPhase,
  revealZonePhase,
} from './phases';
import { defaultState } from './state';
import aiEnumeration from './ai';
import stripSecrets from './strip-secrets';
import bgioEffectsConfig from './config.bgio-effects';
import getGameResult from '../utils/get-game-result';

const BrowserCCG: Game<GameState, Ctx & EffectsCtxMixin<typeof bgioEffectsConfig>> = {
  name: 'BrowserCCG',
  plugins: [EffectsPlugin(bgioEffectsConfig)],

  /**
   * This method uses the `stripSecrets` function to hide
   * the opponent player's hand and deck data from your client.
   * @name playerView
   * @requires stripSecrets
   * @see https://boardgame.io/documentation/#/secret-state
   */
  playerView: (G: GameState, ctx: Ctx, playerId: PlayerID | null) => {
    return stripSecrets(G, ctx, playerId!);
  },

  setup: () => defaultState,

  /**
   * Each phase in boardgame.io defines a set of game configuration options
   * that are applied for the duration of that phase. This includes the
   * ability to define a different set of moves, use a different turn order
   * etc. Turns happen inside phases.
   * @see https://boardgame.io/documentation/#/phases
   *
   * Order of Phases:
   *  - initPlayers
   *  - initZones
   *  - initStartingHands
   *
   *  - revealZone (turns 0,1,2 only)
   *  - incrementGameTurn
   *  - drawCard
   *  - playCards
   *  - revealCardsFaceDown
   *  - revealCards
   *  - initCardMechanics
   *  - initZoneInteractions
   *  - handleZonePowerCalculations
   *
   *  - incrementGameTurn
   *  - drawCard
   *  - playCards
   *  - etc... loop until game ends
   */
  phases: {
    initPlayers: {
      ...initPlayersPhase,
      next: 'initZones',
      start: true,
    },
    initZones: {
      ...initZonesPhase,
      next: 'initStartingHands',
    },
    initStartingHands: {
      ...initStartingHandsPhase,
      next: 'revealZone',
    },
    revealZone: {
      ...revealZonePhase,
      next: 'incrementGameTurn',
    },
    incrementGameTurn: {
      ...incrementGameTurnPhase,
      next: 'drawCard',
    },
    drawCard: {
      ...drawCardPhase,
      next: 'playCards',
    },
    playCards: {
      ...playCardsPhase,
      next: 'revealCardsFaceDown',
    },
    revealCardsFaceDown: {
      ...revealCardsFaceDownPhase,
      next: 'revealCards',
    },
    revealCards: {
      ...revealCardsPhase,
      next: 'initCardMechanics',
    },
    initCardMechanics: {
      ...initCardMechanicsPhase,
      next: 'initZoneInteractions',
    },
    initZoneInteractions: {
      ...initZoneInteractionsPhase,
      next: 'handleZonePowerCalculations',
    },
    handleZonePowerCalculations: {
      ...handleZonePowerCalculationsPhase,
      next: 'revealZone',
    },
  },
  ai: aiEnumeration,
  endIf: (G: GameState, ctx: Ctx) => {
    if (G.turn === G.gameConfig.numerics.numberOfSingleTurnsPerGame) {
      // prettier-ignore
      switch (getGameResult(G.zones)) {
        case '1': return { winner: '1' };
        case '0': return { winner: '0' };
        default:  return { draw: true };
      }
    }
  },
};

export default BrowserCCG;

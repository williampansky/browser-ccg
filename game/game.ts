import type { Ctx, Game } from 'boardgame.io';
import { EffectsPlugin } from 'bgio-effects/plugin';

import type { EffectsCtxMixin } from 'bgio-effects/dist/types';
import type { GameState, PlayerID } from '../types';

import { asyncPhases, defaultPhases } from './phases';
import { defaultState } from './state';
import { gameConfig } from '../app.config';
import aiEnumeration from './ai-enumeration';
import stripSecrets from './strip-secrets';
import bgioEffectsConfig from './config.bgio-effects';
import getGameResult from '../utils/get-game-result';

const { asynchronousTurns } = gameConfig;
const gameUsesAsyncTurns = asynchronousTurns === true;
const gameUsesDefaultTurns = asynchronousTurns === false;

export type CtxWithEffects = Ctx & EffectsCtxMixin<typeof bgioEffectsConfig>;

const BrowserCCG: Game<GameState, CtxWithEffects> = {
  name: 'BrowserCCG',

  /**
   * The Plugin API allows you to create objects that expose custom 
   * functionality to boardgame.io. You can create wrappers 
   * around moves, add API’s to ctx etc.
   * @see https://boardgame.io/documentation/#/plugins
   */
  plugins: [EffectsPlugin(bgioEffectsConfig)],

  /**
   * This method uses the `stripSecrets` function to hide
   * the opponent player's hand and deck data from your client.
   * @requires stripSecrets
   * @see https://boardgame.io/documentation/#/secret-state
   */
  playerView: (G: GameState, ctx: Ctx, playerId: PlayerID | null) => {
    return stripSecrets(G, ctx, playerId!);
  },

  /**
   * Function that returns the initial value of G.setupData is 
   * an optional custom object that is passed through the Game Creation API.
   * @see https://boardgame.io/documentation/#/api/Game
   */
  setup: () => defaultState,

  /**
   * Each phase in boardgame.io defines a set of game configuration options
   * that are applied for the duration of that phase. This includes the
   * ability to define a different set of moves, use a different turn order
   * etc. Turns happen inside phases.
   * @see https://boardgame.io/documentation/#/phases
   */
  phases: gameUsesAsyncTurns ? {...asyncPhases} : {...defaultPhases},

  /**
   * The framework will come bundled with a few different bot algorithms, 
   * and an advanced version of MCTS that will allow you to specify a set 
   * of objectives to optimize for. For example, at any given point in the 
   * game you can tell the bot to gather resources in the short term and 
   * wage wars in the late stages. You just tell the bot what to do and it 
   * will figure out the right combination of moves to make it happen!
   * @see https://boardgame.io/documentation/#/tutorial?id=bots
   */
  ai: aiEnumeration,

  /**
   * End the game if G.turn hits the max per config.
   */
  endIf: (G: GameState, ctx: Ctx) => {
    // prettier-ignore
    if (G.turn === G.gameConfig.numerics.numberOfSingleTurnsPerGame) {
      switch (getGameResult(G.zones)) {
        case '1': return { winner: '1' };
        case '0': return { winner: '0' };
        default:  return { draw: true };
      }
    }
  },
};

export default BrowserCCG;

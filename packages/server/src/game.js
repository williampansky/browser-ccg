import moves from './moves';
import state from './state';
import stripSecrets from './strip-secrets';
import turns from './turns';
import { initGamePhase, initHandsPhase, playGamePhase } from './phases';

/**
 * @see https://boardgame.io/documentation/#/
 */
export default {
  name: 'ReactCCG',
  setup: () => state,
  moves: moves,

  /**
   * This method uses the `stripSecrets` function to hide
   * the opponent player's hand and deck data from your client.
   * @name playerView
   * @requires stripSecrets
   * @see https://boardgame.io/documentation/#/secret-state
   */
  playerView: (G, ctx, playerID) => {
    return stripSecrets(G, playerID);
  },

  /**
   * @name turn
   * @see https://boardgame.io/documentation/#/turn-order
   */
  turn: turns,

  /**
   * Most games beyond very simple ones tend to have different behaviors at
   * various phases. A game might have a phase at the beginning where players
   * are drafting cards before entering a playing phase, for example.
   *
   * @name phases
   * @see https://boardgame.io/documentation/#/phases
   */
  phases: {
    initGamePhase,
    initHandsPhase,
    playGamePhase
  }
};

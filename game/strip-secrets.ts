import { Ctx } from 'boardgame.io';
import { GameState, PlayerID } from '../types';

/**
 * Strips away the following nested fields
 * from the opposing player's client:
 *  - players
 *  - selectedCardData
 *
 * @see https://boardgame.io/documentation/#/secret-state
 */
const stripSecrets = (G: GameState, ctx: Ctx, playerId: PlayerID) => ({
  ...G,
  // players: { [playerId]: G.players[playerId] },
  // selectedCardData: { [playerId]: G.selectedCardData[playerId] },
});

export default stripSecrets;

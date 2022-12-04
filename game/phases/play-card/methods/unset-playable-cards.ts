import { GameState, PlayerID } from '../../../../types';

export const unsetPlayableCards = (G: GameState, player: PlayerID) => {
  G.players[player].cards.hand.forEach((c) => {
    c.canPlay = false;
  });
};

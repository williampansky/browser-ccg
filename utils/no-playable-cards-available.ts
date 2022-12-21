import { GameState, PlayerID } from '../types';

const noPlayableCardsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  let noPlayableCardsAvailable = true;

  G.players[player].cards.hand.forEach((c) => {
    if (c.canPlay) noPlayableCardsAvailable = false;
  })

  return noPlayableCardsAvailable;
};

export default noPlayableCardsAvailable;

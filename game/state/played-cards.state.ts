import { Card, GameState, PlayerID } from '../../types'

const playedCards = {
  defaultState: {
    '0': [],
    '1': []
  },

  push: (G: GameState, playerId: PlayerID, card: Card) => {
    G.playedCards[playerId].push(card);
  },
};

export default playedCards;

import { Card, GameState, PlayerID } from '../../types';

const selectedCardData = {
  defaultState: {
    '0': undefined,
    '1': undefined,
  } as Record<PlayerID, Card | undefined>,

  set: (G: GameState, playerId: PlayerID, dataObj: Card) => {
    G.selectedCardData[playerId] = dataObj;
  },

  reset: (G: GameState, playerId: PlayerID) => {
    G.selectedCardData[playerId] = undefined;
  },
};

export default selectedCardData;

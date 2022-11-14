import {
  GameState,
  PlayerID,
  SelectedCardIndex,
} from '../../types';

const selectedCardIndex = {
  defaultState: {
    '0': undefined,
    '1': undefined,
  } as SelectedCardIndex,

  set: (G: GameState, playerId: PlayerID, index: number): void => {
    G.selectedCardIndex[playerId] = index;
  },

  reset: (G: GameState, playerId: PlayerID): void => {
    G.selectedCardIndex[playerId] = undefined;
  },
};

export default selectedCardIndex;

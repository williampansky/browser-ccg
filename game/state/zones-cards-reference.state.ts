import { gameConfig } from '../../config.app';
import { GameState, PlayerID } from '../../types';

const zonesCardsReference = {
  defaultState: [
    ...Array.from(Array(gameConfig.numerics.numberOfZones)).map(() => {
      return {
        '0': [],
        '1': [],
      };
    }),
  ],

  set: (G: GameState, player: PlayerID, zoneNumber: number, array: []) => {
    G.zonesCardsReference[zoneNumber][player] = array;
  },
};

export default zonesCardsReference;

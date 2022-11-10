import { PlayerID } from '../types';

/**
 * Returns a contextual object of `player: id, opponent: id`
 * based on the provided player param.
 */
const getContextualPlayerIds = (
  player: PlayerID
): {
  player: PlayerID;
  opponent: PlayerID;
} => {
  if (player === '1')
    return {
      player: '1',
      opponent: '0',
    };

  return {
    player: '0',
    opponent: '1',
  };
};

export default getContextualPlayerIds;

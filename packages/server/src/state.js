import { GAME_CONFIG } from '@ccg/config';
import players from './state/players';

export default {
  players: players.__DATA_MODEL,
  turnOrder: ['0', '1'].sort(() => {
    // return ['0', '1'];
    if (!GAME_CONFIG.matchConfig.enableRandomTurnOrder) return ['0', '1'];
    return Math.random() - 0.5;
  })
};

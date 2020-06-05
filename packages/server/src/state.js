import { GAME_CONFIG } from '@ccg/config';

export default {
  turnOrder: ['0', '1'].sort(() => {
    // return ['0', '1'];
    if (!GAME_CONFIG.matchConfig.enableRandomTurnOrder) return ['0', '1'];
    return Math.random() - 0.5;
  })
};

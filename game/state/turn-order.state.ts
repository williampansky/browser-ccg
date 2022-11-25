import { PlayerID } from '../../types';
import { gameConfig } from '../../app.config';

const { asynchronousTurns } = gameConfig;
const gameUsesDefaultTurns = asynchronousTurns === false;

const turnOrder = {
  defaultState: gameUsesDefaultTurns
    ? Math.random() - 0.5 >= 0.25
      ? ['0', '1']
      : ['0', '1']
    : ['0'] as PlayerID[],
};

export default turnOrder;

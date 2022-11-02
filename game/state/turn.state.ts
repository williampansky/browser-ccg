import { add } from 'mathjs';
import { GameState } from '../../types';

const turn = {
  defaultState: 0,
  increment: (G: GameState) => G.turn = add(G.turn, 1),
};

export default turn;

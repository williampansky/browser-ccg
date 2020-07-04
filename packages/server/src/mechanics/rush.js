import boards from '../state/boards';

const initRush = (G, ctx, index) => {
  const { currentPlayer } = ctx;
  return boards.enableCanAttack(G, currentPlayer, index);
};

export default initRush;

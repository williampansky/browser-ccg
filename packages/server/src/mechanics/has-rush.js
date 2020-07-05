import boards from '../state/boards';

const initRush = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].hasRush = true;
  boards.enableCanAttack(G, player, index);
};

export default initRush;

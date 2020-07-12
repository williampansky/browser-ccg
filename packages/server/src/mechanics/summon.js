import createBoardSlotObject from '../creators/create-board-slot-object';

const summonEntourageMinion = (G, ctx, cardId, entourageArray) => {
  const { turnOrder } = G;
  const { currentPlayer, random } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  const summonMinion = (G, player, entourageId) => {
    if (G.boards[player].length === 7) return; // max minions
    G.boards[player].push(createBoardSlotObject(`${entourageId}`));
  };

  switch (cardId) {
    case 'CORE_025':
      return entourageArray.forEach(id => summonMinion(G, currentPlayer, id));

    default:
      return; // eject
  }
};

export default summonEntourageMinion;

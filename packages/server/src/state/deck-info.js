import getCardByID from '../utils/get-card-by-id';

const deckInfo = {
  __DATA_MODEL: {
    '0': [],
    '1': []
  },
  set: (G, player, data) => {
    const unique = [...new Set(data)];
    const duplicates = unique.map(value => {
      return {
        ...getCardByID(value),
        _id: value,
        _amount: data.filter(str => str === value).length
      };
    });
    const sortedDuplicates = duplicates.sort((a, b) => a.cost - b.cost);

    G.deckInfo[player] = sortedDuplicates;
  },
  changeAmount: (G, player, cardId, newAmount) => {
    if (!G.deckInfo[player].find(item => item._id === cardId)) return;
    // const item = G.deckInfo[player].find(item => item.id === cardId);
    G.deckInfo[player].find(item => item._id === cardId)._amount = newAmount;
  }
};

export default deckInfo;

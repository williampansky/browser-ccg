import cardDatabase from '../utils/card-databse';

const getMinionObjectFromDatabase = (id, database = cardDatabase) => {
  if (!database[id]) return;
  return database[id];
};

const createMinionObject = cardId => {
  return getMinionObjectFromDatabase(cardId);
};

export default createMinionObject;

import cardDatabase from './card-databse';
import { v4 as uuidv4 } from 'uuid';

const getCardObjectFromDatabase = (id, database = cardDatabase) => {
  return database[id.replace(' ', '')];
};

const getCardByID = cardId => {
  return {
    ...getCardObjectFromDatabase(cardId),
    uuid: uuidv4()
  };
};

export const getCardByIdWithoutUUID = cardId => {
  return getCardObjectFromDatabase(cardId);
};

export default getCardByID;

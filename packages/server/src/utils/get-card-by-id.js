import CARD_DATABASE from './card-databse';
import { v4 as uuidv4 } from 'uuid';

const getCardObjectFromDatabase = (id, database = CARD_DATABASE) => {
  return database[id.replace(' ', '')];
};

const getCardByID = cardId => {
  return {
    ...getCardObjectFromDatabase(cardId),
    uuid: uuidv4(),
    isPlayable: false,
    isPlaying: false,
    isEnhanced: false
  };
};

export const getCardByIdWithoutUUID = cardId => {
  return getCardObjectFromDatabase(cardId);
};

export default getCardByID;

import {
  CARDS_GAME,
  CARDS_CORE,
  CARDS_PRIME,
  CARDS_ENTOURAGE
} from '@ccg/data';

const cardDatabase = {
  // ...CARDS_GAME,
  ...CARDS_CORE,
  ...CARDS_PRIME,
  ...CARDS_ENTOURAGE
};

export default cardDatabase;

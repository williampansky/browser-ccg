import CARDS_CORE from '../data/cards.core.json';
import CARDS_ENTOURAGE from '../data/cards.entourage.json';
import CARDS_GAME from '../data/cards.game.json';
import CARDS_PRIME from '../data/cards.prime.json';

const cardDatabase = {
  ...CARDS_GAME,
  ...CARDS_CORE,
  ...CARDS_PRIME,
  ...CARDS_ENTOURAGE
};

export default cardDatabase;

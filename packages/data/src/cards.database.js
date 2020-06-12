import CARDS_CORE from './cards.core.json';
import CARDS_ENTOURAGE from './cards.entourage.json';
import CARDS_GAME from './cards.game.json';
import CARDS_PRIME from './cards.prime.json';

const cardsDatabase = {
  // ...CARDS_GAME,
  ...CARDS_CORE,
  ...CARDS_PRIME,
  ...CARDS_ENTOURAGE
};

export default cardsDatabase;

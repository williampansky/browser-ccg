import { SET } from '@ccg/enums';
import initSet002OnPlay from './init-set002-on-play';

const initOnPlayMechanic = (G, ctx, slotObject, cardId, cardSet, index) => {
  G.lastPlayedCardId = cardId;

  // prettier-ignore
  switch (cardSet) {
    // core
    case SET[2]: return initSet002OnPlay(G, ctx, slotObject, cardId, index);

    // eject
    default: return;
  }
};

export default initOnPlayMechanic;

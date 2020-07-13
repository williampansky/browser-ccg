import { SET } from '@ccg/enums';
import initSet002OnPlay from './init-set002-on-play';

const castGlobalSpell = (G, ctx, cardSet, cardId) => {
  G.lastPlayedCardId = cardId;

  // prettier-ignore
  switch (cardSet) {
    // core
    case SET[2]: return initSet002OnPlay(G, ctx, cardId);

    // eject
    default: return;
  }
};

export default castGlobalSpell;

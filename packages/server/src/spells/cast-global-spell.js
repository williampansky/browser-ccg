// import castGame001 from './game.001';
// import initCoreSpell from './core-spells';
import { SET } from '@ccg/enums';
import castGlobalGameSpell from './cast-global-game-spell';
import castGlobalSet002Spell from './cast-global-set002-spell';

const castGlobalSpell = (G, ctx, cardSet, cardId) => {
  G.lastPlayedCardId = cardId;

  // prettier-ignore
  switch (cardSet) {
    // game
    case SET[1]: return castGlobalGameSpell(G, ctx, cardId);

    // core
    case SET[2]: return castGlobalSet002Spell(G, ctx, cardId);

    // eject
    default: return;
  }
};

export default castGlobalSpell;

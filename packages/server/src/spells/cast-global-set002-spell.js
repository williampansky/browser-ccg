import { add } from 'mathjs';
import actionPoints from '../state/action-points';
import drawCard from '../moves/draw-card';

const castGlobalSet002Spell = (G, ctx, cardId) => {
  const { turnOrder } = G;
  const { currentPlayer, random } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  // prettier-ignore
  switch (cardId) {
    // Draw the next 4 cards from your deck.
    case 'CORE_102':
      drawCard(G, ctx, currentPlayer, 4);
      break;

    // eject
    default: return;
  }
};

export default castGlobalSet002Spell;

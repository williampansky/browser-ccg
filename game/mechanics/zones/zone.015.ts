import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID, Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import { counts } from '../../state';

import setsCore from '../../data/setsCore.json';

/**
 * Add a random card to each player's hand
 */
const zone015 = {
  init: (G: GameState, ctx: Ctx, zone: Zone) => {
    if (zone.revealed) {
      zone015.exec(G, ctx, '0');
      zone015.exec(G, ctx, '1');
    }
  },

  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID
  ) => {
    const { numerics } = G.gameConfig;

    if (G.players[player].cards.hand.length < numerics.cardsPerHand) {
      const randomCardBase = ctx.random!.Shuffle(setsCore)[0];
      const randomCard = createCardObject(randomCardBase!);

      if (randomCard) {
        G.players[player].cards.hand.push(randomCard);
        counts.incrementHand(G, player);
      }
    }
  },
};

export default zone015;

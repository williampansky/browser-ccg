import { EffectsCtxMixin } from 'bgio-effects';
import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import { discardCardFromPlayersHand } from '../../../utils';

/**
 * discard random card from player's hand
 */
export const core118 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const { numberPrimary } = card;
  const hand = G.players[player].cards.hand;
  for (let index = 0; index < numberPrimary; index++) {
    const randomCard = ctx.random?.Shuffle(hand)[0];

    if (randomCard) {
      discardCardFromPlayersHand(G, ctx, player, randomCard?.uuid);
    }
  }
};

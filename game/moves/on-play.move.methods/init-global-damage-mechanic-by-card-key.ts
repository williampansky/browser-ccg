import { lte } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { getContextualPlayerIds } from '../../../utils';
import { dealAoeDamageOnPlay } from '../../mechanics/on-play-mechanics';
import core060 from '../../mechanics/core-mechanics-by-key/mechanic.core.060';

/**
 *
 */
export default function initGlobalDamageMechanicByCardKey(
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  const { opponent } = getContextualPlayerIds(player);

  switch (card.key) {
    case 'SET_CORE_038':
      dealAoeDamageOnPlay(G, ctx, player, card, card.mechanicsSide);
      break;
    case 'SET_CORE_060':
      core060.exec(G, ctx, player, zoneNumber, card);
      break;
    case 'SET_CORE_121':
      dealAoeDamageOnPlay(G, ctx, player, card, card.mechanicsSide);
      break;
    case 'SET_CORE_122':
      dealAoeDamageOnPlay(G, ctx, player, card, card.mechanicsSide);
      break;
    case 'SET_CORE_124':
      dealAoeDamageOnPlay(G, ctx, player, card, card.mechanicsSide);
      break;
    case 'SET_CORE_125':
      dealAoeDamageOnPlay(G, ctx, player, card, card.mechanicsSide);
      break;
  }

  const check = (c: Card) => {
    if (lte(c.displayHealth, 0)) {
      c.booleans.isDestroyed = true;
      c.destroyedOnTurn = G.turn;
    }
  };

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => check(c));
    z.sides[opponent].forEach((c) => check(c));
  });
}

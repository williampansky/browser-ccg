import type { Ctx } from 'boardgame.io';
import type {
  Card,
  CardBase,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import setsCore from '../../data/setsCore.json';
import {
  createCardObject,
  getRandomNumberBetween as randomNum,
} from '../../../utils';
import { counts } from '../../state';

/**
 * on play: add a random legendary to your hand
 */
export const core011 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const { numerics } = gameConfig;
  const cardsArr = setsCore.filter((c: CardBase) => {
    return c.rarity === '%RARITY_MYTHIC%' && c.id !== card?.id;
  });

  if (G.players[player].cards.hand.length < numerics.cardsPerHand) {
    const randomCardBase = ctx.random!.Shuffle(cardsArr)[0];
    const randomCard = createCardObject(randomCardBase);
    G.players[player].cards.hand.push(randomCard);
    counts.incrementHand(G, player);
  }
};

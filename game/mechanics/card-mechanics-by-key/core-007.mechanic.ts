import type { Ctx } from 'boardgame.io';
import type {
  Card,
  CardBase,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import setsEntourage from '../../data/setsEntourage.json';
import {
  createCardObject,
  getRandomNumberBetween as randomNum,
} from '../../../utils';

/**
 * on play: summon two 1/1 minions to each other zone
 */
export const core007 = (
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

  G.zones.forEach((z, i) => {
    if (zoneIdx !== i) {
      if (z.sides[player].length < numerics.numberOfSlotsPerZone) {
        const entArr = setsEntourage.filter((ent: CardBase) => {
          return ent.key!.match(`${ent.set?.replace(/\%/g, '')}`);
        });

        const entObj = entArr[randomNum(0, card.entourage!.length - 1)];
        const entourageCard = createCardObject(entObj);
        const entCardObj = { ...entourageCard, revealed: true };
        z.sides[player].push(entCardObj);
        G.zonesCardsReference[i][player].push(entCardObj);
      }
    }
  });
};

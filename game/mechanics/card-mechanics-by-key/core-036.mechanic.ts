import type { Ctx } from 'boardgame.io';
import type {
  Card,
  CardBase,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import {
  createCardObject,
  getRandomNumberBetween as randomNum,
} from '../../../utils';

import setsEntourage from '../../data/setsEntourage.json';

/**
 * summon random relative entourage card
 */
export const core036 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const { entourage } = card;
  const { numerics } = gameConfig;
  const entArr = setsEntourage.filter((ent: CardBase) => {
    const set = ent.set?.replace(/\%/g, '');
    const id = card?.id;
    return ent.key!.includes(`${set}_${id}`);
  });

  G.zones.forEach((z, i) => {
    if (zoneIdx === i) {
      if (z.sides[player].length < numerics.numberOfSlotsPerZone) {
        const entObj = entArr[randomNum(0, entourage!.length - 1)];
        const entourageCard = createCardObject(entObj);
        const entCardObj = { ...entourageCard, revealed: true };
        zone.sides[player].push(entCardObj);
        G.zonesCardsReference[i][player].push(entCardObj);
      }
    }
  });
};

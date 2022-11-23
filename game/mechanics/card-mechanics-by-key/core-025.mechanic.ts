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
 * on play: summon 2/1 droid companion
 */
export const core025 = (
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
  
  if (zone.sides[player].length < numerics.numberOfSlotsPerZone) {
    const entArr = setsEntourage.filter((ent: CardBase) => {
      const set = ent.set?.replace(/\%/g, '');
      const id = card?.id;
      return ent.key!.includes(`${set}_${id}`);
    });

    const entObj = entArr[0];
    const entourageCard = createCardObject(entObj);
    const entCardObj = { ...entourageCard, revealed: true };
    zone.sides[player].push(entCardObj);
    G.zonesCardsReference[zoneIdx][player].push(entCardObj);
  }
};

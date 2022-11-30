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
 * on play: summon 2/1 droid companion
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
          const set = ent.set?.replace(/\%/g, '');
          const id = card?.id;
          return ent.key!.includes(`${set}_${id}`);
        });

        const entObj = entArr[randomNum(0, card.entourage!.length - 1)];
        const entourageCard = createCardObject(entObj);
        const entCardObj = { ...entourageCard, revealed: true };
        z.sides[player].push(entCardObj);
        card.booleans.onPlayWasTriggered = true;
      }
    }
  });
};

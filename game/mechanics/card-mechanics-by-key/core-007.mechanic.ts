import type { Ctx } from 'boardgame.io';
import type {
  Card,
  CardBase,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import { createCardObject, getRandomNumberBetween } from '../../../utils';
import setsEntourage from '../../data/setsEntourage.json';

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
        const obj = setsEntourage.find(
          (e: CardBase) =>
            e.key ===
            card.entourage![
              getRandomNumberBetween(0, card.entourage!.length - 1)
            ]
        );

        const entourageCard = createCardObject(obj!);
        const entCardObj = { ...entourageCard, revealed: true };
        z.sides[player].push(entCardObj);
        G.zonesCardsReference[i][player].push(entCardObj);
      }
    }
  });
};

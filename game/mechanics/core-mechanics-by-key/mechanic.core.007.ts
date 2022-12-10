import type { Ctx } from 'boardgame.io';
import type { Card, CardBase, GameState, PlayerID } from '../../../types';

import {
  createCardObject,
  getRandomNumberBetween as randomNum,
  pushEventStream,
} from '../../../utils';

import setsEntourage from '../../data/setsEntourage.json';

/**
 * on play: summon 1/1 minions to the other zones
 */
const core007 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numerics } = G.gameConfig;

    G.zones.forEach((z, i) => {
      if (zoneNumber !== i) {
        if (z.sides[player].length < numerics.numberOfSlotsPerZone) {
          const entArr = setsEntourage.filter((ent: CardBase) => {
            const set = ent.set.replace(/\%/g, '');
            const id = playedCard.id;
            return ent.key.includes(`${set}_${id}`);
          });

          const entObj = entArr[randomNum(0, playedCard.entourage!.length - 1)];
          const entourageCard = createCardObject(entObj);
          const entCardObj = { ...entourageCard, revealed: true };
          z.sides[player].push(entCardObj);

          pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
          playedCard.booleans.onPlayWasTriggered = true;
        }
      }
    });
  },
};

export default core007;

import type { Ctx } from 'boardgame.io';
import type { Card, CardBase, GameState, PlayerID } from '../../../types';
import { Mechanics } from '../../../enums';
import {
  aiSpreadEventStreamAndOnPlayBoolean,
  createCardObject,
  healMinion,
  pushEventStreamAndSetBoolean,
} from '../../../utils';

import setsEntourage from '../../data/setsEntourage.json';

/**
 * summon random relative entourage card
 */
const core036 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numerics } = G.gameConfig;

    G.zones.forEach((z, i) => {
      if (zoneNumber === i) {
        if (z.sides[player].length < numerics.numberOfSlotsPerZone) {
          const entArr = setsEntourage.filter((ent: CardBase) => {
            const set = ent.set.replace(/\%/g, '');
            const id = playedCard.id;
            return ent.key!.includes(`${set}_${id}`);
          });

          const entObj = ctx.random?.Shuffle(entArr)[0];

          if (entObj) {
            const entourageCard = createCardObject(entObj);
            const entCardObj = { ...entourageCard, revealed: true };

            z.sides[player].push(entCardObj);

            pushEventStreamAndSetBoolean(
              G,
              ctx,
              player,
              zoneNumber,
              playedCard,
              playedCard,
              'onPlayWasTriggered'
            );

            if (entCardObj?.mechanics?.includes(Mechanics.Heal)) {
              z.sides[player].forEach((c) => {
                healMinion(c, entCardObj);
              });

              // pushEventStreamAndSetBoolean(
              //   G,
              //   ctx,
              //   player,
              //   zoneNumber,
              //   entCardObj,
              //   entCardObj,
              //   'onPlayWasTriggered'
              // );
            }

            if (entCardObj?.mechanics?.includes(Mechanics.Hidden)) {
              entCardObj.booleans.isHidden = true;
            }
          }
        }
      }
    });
  },

  execAi: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card,
    playedCardIdx: number
  ) => {
    const { numerics } = G.gameConfig;

    G.zones.forEach((z, i) => {
      if (zoneNumber === i) {
        if (z.sides[player].length < numerics.numberOfSlotsPerZone) {
          const entArr = setsEntourage.filter((ent: CardBase) => {
            const set = ent.set.replace(/\%/g, '');
            const id = playedCard.id;
            return ent.key!.includes(`${set}_${id}`);
          });

          const entObj = ctx.random?.Shuffle(entArr)[0];

          if (entObj) {
            const entourageCard = createCardObject(entObj);
            const entCardObj = { ...entourageCard, revealed: true };

            z.sides[player].push(entCardObj);

            aiSpreadEventStreamAndOnPlayBoolean(
              G,
              ctx,
              player,
              zoneNumber,
              playedCard,
              playedCardIdx,
              playedCard,
              'onPlayWasTriggered'
            );

            if (entCardObj?.mechanics?.includes(Mechanics.Heal)) {
              z.sides[player].forEach((c) => {
                healMinion(c, entCardObj);
              });

              // pushEventStreamAndSetBoolean(
              //   G,
              //   ctx,
              //   player,
              //   zoneNumber,
              //   entCardObj,
              //   entCardObj,
              //   'onPlayWasTriggered'
              // );
            }

            if (entCardObj?.mechanics?.includes(Mechanics.Hidden)) {
              entCardObj.booleans.isHidden = true;
            }
          }
        }
      }
    });
  },
};

export default core036;

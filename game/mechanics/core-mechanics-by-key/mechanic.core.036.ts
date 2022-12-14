import type { Ctx } from 'boardgame.io';
import type { Card, CardBase, GameState, PlayerID } from '../../../types';
import { aiSpreadEventStreamAndOnPlayBoolean, createCardObject, pushEventStreamAndSetBoolean } from '../../../utils';
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
    playedCardIdx: number,
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
          }
        }
      }
    });
  },
};

export default core036;

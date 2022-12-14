import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../../../types';
import { CardRace } from '../../../enums';
import {
  cardIsNotSelf,
  getCardPower,
  isBotGame,
  pushEventStream,
  pushPowerStreamAndSetDisplay,
} from '../../../utils';

/**
 * buff +num1 power whenever you play a sprite card
 */
const core009 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    zone: Zone,
    zoneIndex: number,
    listenerCard: Card,
    listenerCardIndex: number,
    player: PlayerID
  ) => {
    const { card } = G.lastCardPlayed;
    const { numberPrimary, powerStream } = listenerCard;

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => {
        const revealedThisTurn = c.revealedOnTurn === G.turn;
        const cardIsSprite = c.race === CardRace.Sprite;
        const cardNotInStream = !powerStream.find((o) => o.uuid === c.uuid);

        if (cardIsNotSelf(c, listenerCard)) {
          if (cardIsSprite && revealedThisTurn && cardNotInStream) {
            if (isBotGame(ctx)) {
              aiSpread(G, ctx, player, zoneIndex, listenerCard, card);
            } else {
              // find the core009 card node
              const self = G.zones[zoneIndex].sides[player][listenerCardIndex];

              // set animations and bools
              pushEventStream(self, c, 'eventWasTriggered');
              if (!self.booleans.eventWasTriggered) {
                self.booleans.eventWasTriggered = true;
              }

              if (!self.booleans.isBuffed) {
                self.booleans.isBuffed = true;
              }

              if (!self.booleans.hasPowerIncreased) {
                self.booleans.hasPowerIncreased = true;
              }

              // push powerStream and set it
              pushPowerStreamAndSetDisplay(
                self,
                c,
                numberPrimary!,
                add(listenerCard.displayPower, numberPrimary!)
              );
            }
          }
        }
      });
    });
  },
};

function aiSpread(
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  zoneNumber: number,
  cardToAdjust: Card,
  cardToBlame?: Card
) {
  const cardToAdjustIdx = G.zones[zoneNumber].sides[player].findIndex((o) => {
    return o.uuid === cardToAdjust.uuid;
  });

  // push streams
  G.zones[zoneNumber].sides[player][cardToAdjustIdx] = {
    ...G.zones[zoneNumber].sides[player][cardToAdjustIdx],
    booleans: {
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].booleans,
      eventWasTriggered: true,
      isBuffed: true,
      hasPowerIncreased: true,
    },
    eventStream: [
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].eventStream,
      {
        blame: cardToBlame ? cardToBlame.name : cardToAdjust.name,
        event: 'eventWasTriggered',
        uuid: cardToBlame ? cardToBlame.uuid : cardToAdjust.uuid,
      },
    ],
    powerStream: [
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].powerStream,
      {
        blame: cardToBlame ? cardToBlame.name : cardToAdjust.name,
        adjustment: cardToAdjust.numberPrimary,
        currentPower: add(
          cardToAdjust.displayPower,
          cardToAdjust.numberPrimary
        ),
        uuid: cardToBlame ? cardToBlame.uuid : cardToAdjust.uuid,
      },
    ],
  };

  // set display power
  G.zones[zoneNumber].sides[player][cardToAdjustIdx] = {
    ...G.zones[zoneNumber].sides[player][cardToAdjustIdx],
    displayPower: getCardPower(
      G.zones[zoneNumber].sides[player][cardToAdjustIdx]
    ),
  };
}

export default core009;

import { add } from 'mathjs';
import { gte } from 'lodash';

import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';

import {
  cardIsNotSelf,
  cardUuidMatch,
  getCardPower,
  isBotGame,
  pushEventStream,
  pushPowerStreamAndSetDisplay,
} from '../../../utils';

/**
 * on play: +num1 Power if you have num2 or more other cards here
 */
const core005 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const zoneSide = G.zones[zoneNumber].sides[player];
    let counter: number = 0;

    zoneSide.forEach((c) => {
      if (cardIsNotSelf(c, playedCard)) counter++;
      else return;
    });

    if (gte(counter, playedCard.numberSecondary)) {
      if (isBotGame(ctx)) {
        aiSpread(G, ctx, player, zoneNumber, playedCard);
      } else {
        const selfIdx = zoneSide.findIndex((c) => cardUuidMatch(c, playedCard));
        const self = G.zones[zoneNumber].sides[player][selfIdx];

        pushPowerStreamAndSetDisplay(
          self,
          self,
          self.numberPrimary,
          add(self.displayPower, self.numberPrimary)
        );

        self.booleans.hasPowerIncreased = true;
        self.booleans.onPlayWasTriggered = true;
        pushEventStream(self, self, 'onPlayWasTriggered');
      }
    }
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
      onPlayWasTriggered: true,
      hasPowerIncreased: true,
    },
    eventStream: [
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].eventStream,
      {
        blame: cardToBlame ? cardToBlame.name : cardToAdjust.name,
        event: 'onPlayWasTriggered',
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

export default core005;

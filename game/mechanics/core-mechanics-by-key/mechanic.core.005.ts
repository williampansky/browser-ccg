import { add } from 'mathjs';
import { gte } from 'lodash';

import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';

import {
  cardIsNotSelf,
  cardUuidMatch,
  getCardPower,
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
  },

  execAi: (
    G: GameState,
    ctx: Ctx,
    aiID: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const zoneSide = G.zones[zoneNumber].sides[aiID];

    if (gte(zoneSide.length, playedCard.numberSecondary + 1))
      G.zones[zoneNumber].sides[aiID].forEach((c, cI) => {
        if (cardUuidMatch(c, playedCard)) {
          G.zones[zoneNumber].sides[aiID][cI] = {
            ...G.zones[zoneNumber].sides[aiID][cI],
            booleans: {
              ...G.zones[zoneNumber].sides[aiID][cI].booleans,
              onPlayWasTriggered: true,
              hasPowerIncreased: true,
            },
            eventStream: [
              ...G.zones[zoneNumber].sides[aiID][cI].eventStream,
              {
                blame: playedCard.name,
                event: 'onPlayWasTriggered',
                uuid: playedCard.uuid,
              },
            ],
            powerStream: [
              ...G.zones[zoneNumber].sides[aiID][cI].powerStream,
              {
                blame: playedCard.name,
                adjustment: playedCard.numberPrimary,
                currentPower: add(
                  playedCard.displayPower,
                  playedCard.numberPrimary
                ),
                uuid: playedCard.uuid,
              },
            ],
          };

          // set display power
          G.zones[zoneNumber].sides[aiID][cI] = {
            ...G.zones[zoneNumber].sides[aiID][cI],
            displayPower: getCardPower(G.zones[zoneNumber].sides[aiID][cI]),
          };
        }
      });
  },
};

export default core005;

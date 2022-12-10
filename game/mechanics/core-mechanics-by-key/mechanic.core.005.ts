import { add } from 'mathjs';
import { gte } from 'lodash';

import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';

import {
  cardIsNotSelf,
  cardUuidMatch,
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
};

export default core005;

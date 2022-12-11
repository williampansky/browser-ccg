import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { CardType } from '../../../enums';
import {
  pushPowerStreamAndSetDisplay,
  pushHealthStreamAndSetDisplay,
  pushEventStream,
} from '../../../utils';

/**
 * your minions have +num1/num2
 */
const core042 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numberPrimary, numberSecondary } = playedCard;

    G.zones.forEach((z, zIdx) => {
      z.sides[player].forEach((c) => {
        const zoneMatch = zIdx === zoneNumber;
        const isNotSelf = c.uuid !== playedCard.uuid;
        const isMinion = c.type === CardType.Minion;

        playedCard.booleans.onPlayWasTriggered = true;
        pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');

        if (zoneMatch && isNotSelf && isMinion) {
          c.booleans.hasHealthIncreased = true;
          pushHealthStreamAndSetDisplay(
            c,
            playedCard,
            numberSecondary,
            add(c.displayHealth, numberSecondary)
          );

          c.booleans.hasPowerIncreased = true;
          pushPowerStreamAndSetDisplay(
            c,
            playedCard,
            numberPrimary,
            add(c.displayPower, numberPrimary)
          );
        }
      });
    });
  },
};

export default core042;

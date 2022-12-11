import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { CardType } from '../../../enums';
import {
  cardIsNotSelf,
  pushEventStream,
  pushPowerStreamAndSetDisplay,
} from '../../../utils';

/**
 * boon: your other sprites have +2 attack power
 */
export const core029 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numberPrimary } = playedCard;

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => {
        const isNotSelf = cardIsNotSelf(c, playedCard);
        const isMinion = c.type === CardType.Minion;

        if (isNotSelf && isMinion) {
          c.booleans.isBuffed = true;
          c.booleans.hasPowerIncreased = true;
          pushPowerStreamAndSetDisplay(
            c,
            playedCard,
            numberPrimary,
            add(c.displayPower, numberPrimary)
          );

          playedCard.booleans.onPlayWasTriggered = true;
          pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
        }
      });
    });
  },
};

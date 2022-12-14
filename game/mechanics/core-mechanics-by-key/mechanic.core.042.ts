import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { CardType } from '../../../enums';
import {
  pushPowerStreamAndSetDisplay,
  pushHealthStreamAndSetDisplay,
  pushEventStream,
  cardUuidMatch,
  pushEventStreamAndSetBoolean,
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

  execAi: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card,
    playedCardIdx: number
  ) => {
    const { numberPrimary, numberSecondary } = playedCard;

    G.zones.forEach((z, zIdx) => {
      z.sides[player].forEach((c, ci) => {
        const zoneMatch = zIdx === zoneNumber;
        const isNotSelf = c.uuid !== playedCard.uuid;
        const isMinion = c.type === CardType.Minion;

        if (zoneMatch && isNotSelf && isMinion) {
          G.zones[zoneNumber].sides[player][ci] = {
            ...G.zones[zoneNumber].sides[player][ci],
            booleans: {
              ...G.zones[zoneNumber].sides[player][ci].booleans,
              hasHealthIncreased: true,
              hasPowerIncreased: true,
            },
            displayHealth: add(c.displayHealth, numberSecondary),
            displayPower: add(c.displayPower, numberPrimary),
            healthStream: [
              ...G.zones[zoneNumber].sides[player][ci].healthStream,
              {
                blame: G.zones[zoneNumber].sides[player][ci].name,
                adjustment: numberSecondary,
                currentHealth: add(c.displayHealth, numberSecondary),
                uuid: G.zones[zoneNumber].sides[player][ci].uuid,
              },
            ],
            powerStream: [
              ...G.zones[zoneNumber].sides[player][ci].powerStream,
              {
                blame: G.zones[zoneNumber].sides[player][ci].name,
                adjustment: numberSecondary,
                currentPower: add(c.displayPower, numberPrimary),
                uuid: G.zones[zoneNumber].sides[player][ci].uuid,
              },
            ],
          };
        }

        if (cardUuidMatch(c, playedCard)) {
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
      });
    });
  },
};

export default core042;

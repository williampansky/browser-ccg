import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { CardType } from '../../../enums';
import {
  aiSpreadEventStreamAndOnPlayBoolean,
  cardIsNotSelf,
  pushEventStreamAndSetBoolean,
  pushPowerStreamAndSetDisplay,
} from '../../../utils';

/**
 * buff all minions with have +num1 power
 */
const core029 = {
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

  execAi: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card,
    playedCardIdx: number,
  ) => {
    const { numberPrimary } = playedCard;

    G.zones.forEach((z, zi) => {
      z.sides[player].forEach((c, ci) => {
        const isNotSelf = cardIsNotSelf(c, playedCard);
        const isMinion = c.type === CardType.Minion;

        if (isNotSelf && isMinion) {
          G.zones[zi].sides[player][ci] = {
            ...G.zones[zi].sides[player][ci],
            booleans: {
              ...G.zones[zi].sides[player][ci].booleans,
              isBuffed: true,
              hasPowerIncreased: true,
            },
            displayPower: add(c.displayPower, numberPrimary),
            powerStream: [
              ...G.zones[zi].sides[player][ci].powerStream,
              {
                blame: playedCard.name,
                adjustment: numberPrimary,
                currentPower: add(c.displayPower, numberPrimary),
                uuid: playedCard.uuid
              }
            ]
          }

          aiSpreadEventStreamAndOnPlayBoolean(
            G,
            ctx,
            player,
            zoneNumber,
            playedCard,
            playedCardIdx,
            undefined,
            'onPlayWasTriggered'
          );
        }
      });
    });
  },
};

export default core029;

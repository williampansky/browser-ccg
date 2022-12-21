import { lt } from 'lodash';
import { add, isNegative, subtract } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { CardMechanicsSide } from '../../../enums';
import {
  getContextualPlayerIds,
  getMechanicTargetSide,
  pushEventStream,
  pushPowerStreamAndSetDisplay,
} from '../../../utils';

/**
 * Pushes a buff to each card in this zone's powerStream
 */
const buffPowerOfCardsInZone = (
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  cardPlayed: Card,
  player: PlayerID
) => {
  const { opponent } = getContextualPlayerIds(player);
  const targetPlayerSide = getMechanicTargetSide(cardPlayed, player);
  const cardPlayedIdx = G.zones[zoneNumber].sides[player].findIndex((c) => {
    return c.uuid === cardPlayed.uuid;
  });

  const init = (c: Card, ci: number, cardPlayedIndex: number) => {
    const isNotCardPlayed = cardPlayed.uuid !== c.uuid;
    const cardIsBeforeCardPlayed = lt(ci, cardPlayedIndex);

    if (cardPlayed.uuid === c.uuid) {
      c.booleans.onPlayWasTriggered = true;
      pushEventStream(c, c, 'onPlayWasTriggered');
    } else if (isNotCardPlayed && cardIsBeforeCardPlayed) {
      c.booleans.isBuffed = true;
      c.booleans.hasPowerIncreased = true;

      pushPowerStreamAndSetDisplay(
        c,
        cardPlayed,
        cardPlayed.numberPrimary,
        add(c.displayPower, cardPlayed.numberPrimary)
      );
    }
  };

  if (targetPlayerSide === CardMechanicsSide.Both) {
    G.zones.forEach((_, zi) => {
      if (zi === zoneNumber) {
        G.zones[zi].sides[player].forEach((c, ci) => {
          init(c, ci, cardPlayedIdx);
        });

        G.zones[zi].sides[opponent].forEach((c, ci) => {
          init(c, ci, cardPlayedIdx);
        });
      }
    });
  } else {
    G.zones.forEach((_, zi) => {
      if (zi === zoneNumber) {
        G.zones[zi].sides[targetPlayerSide].forEach((c, ci) => {
          init(c, ci, cardPlayedIdx);
        });
      }
    });
  }
};

export default buffPowerOfCardsInZone;

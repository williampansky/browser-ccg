import { add } from 'mathjs';
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
 * Pushes a boon to each card in this zone's powerStream
 */
const boonPowerOfCardsInZone = (
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

  const init = (p: PlayerID, c: Card, ci: number, zi: number) => {
    const isCardPlayed = cardPlayed.uuid === c.uuid;
    const isNotCardPlayed = cardPlayed.uuid !== c.uuid;

    if (isCardPlayed) {
      G.zones[zi].sides[p][ci].booleans.onPlayWasTriggered = true;
      pushEventStream(c, c, 'onPlayWasTriggered');
    } else if (isNotCardPlayed) {
      c.booleans.isBooned = true;
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
          init(player, c, ci, zi);
        });

        G.zones[zi].sides[opponent].forEach((c, ci) => {
          init(opponent, c, ci, zi);
        });
      }
    });
  } else {
    G.zones.forEach((_, zi) => {
      if (zi === zoneNumber) {
        G.zones[zi].sides[targetPlayerSide].forEach((c, ci) => {
          init(targetPlayerSide, c, ci, zi);
        });
      }
    });
  }
};

export default boonPowerOfCardsInZone;

import { subtract } from 'mathjs';
import { CardMechanicsSide as Side } from '../../../enums';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  cardIsNotSelf,
  cardUuidMatch,
  getContextualPlayerIds,
  pushEventStream,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

const { Player, Opponent, Both, None } = Side;

const dealAoeDamageOnPlay = (
  G: GameState,
  player: PlayerID,
  card: Card,
  targetSide?: Side.Player | Side.Opponent | Side.Both | Side.None | string
) => {
  const { numberPrimary } = card;
  const { opponent } = getContextualPlayerIds(player);
  const targetBothSides = targetSide === Both;
  const noTargetSide = !targetSide || targetSide === None || targetBothSides;
  const targetPlayerSide = targetSide === Player || noTargetSide;
  const targetOpponentSide = targetSide === Opponent || noTargetSide;

  G.zones.forEach((z) => {
    if (targetPlayerSide) {
      z.sides[player].forEach((c) => {
        if (cardIsNotSelf(c, card) && !c.booleans.isDestroyed) {
          c.booleans.hasHealthReduced = true;
          pushHealthStreamAndSetDisplay(
            c,
            card,
            numberPrimary,
            subtract(c.displayHealth, numberPrimary)
          );
        }
      });
    }

    if (targetOpponentSide) {
      z.sides[opponent].forEach((c) => {
        if (cardIsNotSelf(c, card) && !c.booleans.isDestroyed) {
          c.booleans.hasHealthReduced = true;
          pushHealthStreamAndSetDisplay(
            c,
            card,
            numberPrimary,
            subtract(c.displayHealth, numberPrimary)
          );
        }
      });
    }
  });

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (cardUuidMatch(c, card)) {
        c.booleans.onPlayWasTriggered = true;
        pushEventStream(c, c, 'onPlayWasTriggered');
      }
    });
  });
};

export default dealAoeDamageOnPlay;

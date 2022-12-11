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

const dealAoeDamageOnPlay = (
  G: GameState,
  player: PlayerID,
  card: Card,
  target?:
    | Side.Player
    | Side.Opponent
    | Side.Both
    | string
) => {
  const { numberPrimary } = card;
  const { opponent } = getContextualPlayerIds(player);

  G.zones.forEach((z) => {
    if (!target || target === Side.Player || target === Side.Both) {
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

    if (!target || target === Side.Opponent || target === Side.Both) {
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

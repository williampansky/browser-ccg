import { subtract } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { CardMechanicsSide as Side } from '../../../enums';
import {
  cardIsNotSelf,
  cardUuidMatch,
  getContextualPlayerIds,
  pushEventStream,
  pushEventStreamAndSetBoolean,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';
import { lte } from 'lodash';

const { Player, Opponent, Both, None } = Side;

const dealAoeDamageOnPlay = (
  G: GameState,
  ctx: Ctx,
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

  G.zones.forEach((z, zi) => {
    z.sides[player].forEach((c) => {
      if (cardUuidMatch(c, card)) {
        pushEventStreamAndSetBoolean(
          G,
          ctx,
          player,
          zi,
          c,
          c,
          'onPlayWasTriggered'
        );
      }
    });
  });

  const check = (c: Card) => {
    if (lte(c.displayHealth, 0)) {
      c.booleans.isDestroyed = true;
      c.destroyedOnTurn = G.turn;
    }
  };

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => check(c));
    z.sides[opponent].forEach((c) => check(c));
  });
};

export default dealAoeDamageOnPlay;

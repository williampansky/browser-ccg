import { Ctx } from 'boardgame.io';
import { lte } from 'lodash';
import { add, subtract } from 'mathjs';
import { Card, GameState, PlayerID } from '../../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  limitNumberWithinRange,
  pushHealthStreamAndSetDisplay,
} from '../../../../utils';

export const attackMinion = (
  G: GameState,
  ctx: Ctx,
  cardToAttack: Card,
  lastPlayedCard: Card,
  targetPlayer: PlayerID
) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToAttack)) {
      pushHealthStreamAndSetDisplay(
        c,
        lastPlayedCard,
        lastPlayedCard.numberPrimary,
        subtract(c.displayHealth, lastPlayedCard.numberPrimary),
      );

      if (lte(c.displayHealth, 0)) c.booleans.isDestroyed = true;
    }

    if (cardUuidMatch(c, lastPlayedCard)) {
      c.booleans.onPlayWasTriggered = true;
    }
  };

  G.zones.forEach((z) => {
    z.sides[targetPlayer].forEach((c) => init(c));
    z.sides[opponent].forEach((c) => init(c));
  });

  G.lastMoveMade = 'healMinion';
  ctx.events?.setPhase('playCard');
};

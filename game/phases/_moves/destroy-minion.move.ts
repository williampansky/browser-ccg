import { Ctx } from 'boardgame.io';
import { lte } from 'lodash';
import { add, subtract } from 'mathjs';
import { Card, GameState, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  limitNumberWithinRange,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

export const destroyMinion = (
  G: GameState,
  ctx: Ctx,
  cardToDestroy: Card,
  lastPlayedCard: Card,
  targetPlayer: PlayerID
) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToDestroy)) {
      c.booleans.isDestroyed = true;
      c.booleans.canBeDestroyed = false;
    }

    if (cardUuidMatch(c, lastPlayedCard)) {
      c.booleans.onPlayWasTriggered = true;
    }
  };

  G.zones.forEach((z) => {
    z.sides[targetPlayer].forEach((c) => init(c));
    z.sides[opponent].forEach((c) => init(c));
  });

  G.lastMoveMade = 'destroyMinion';
  ctx.events?.setPhase('playCard');
};

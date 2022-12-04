import { Ctx } from 'boardgame.io';
import { add } from 'mathjs';
import { Card, GameState, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  limitNumberWithinRange,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';
import { core031Buff } from '../../mechanics/core-mechanics-by-key/mechanic.core.031';
import { core110Buff } from '../../mechanics/core-mechanics-by-key/mechanic.core.110';

export const buffMinion = (
  G: GameState,
  ctx: Ctx,
  cardToBuff: Card,
  lastPlayedCard: Card,
  targetPlayer: PlayerID
) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToBuff)) {
      switch (lastPlayedCard.key) {
        case 'SET_CORE_031':
          core031Buff(G, ctx, targetPlayer, c?.uuid, lastPlayedCard);
          break;
        case 'SET_CORE_110':
          core110Buff(G, ctx, targetPlayer, c?.uuid, lastPlayedCard);
          break;
        default:
          break;
      }
    }

    if (cardUuidMatch(c, lastPlayedCard)) {
      c.booleans.onPlayWasTriggered = true;
    }
  };

  G.zones.forEach((z) => {
    z.sides[targetPlayer].forEach((c) => init(c));
    z.sides[opponent].forEach((c) => init(c));
  });

  G.lastMoveMade = 'buffMinion';
  ctx.events?.setPhase('playCard');
};

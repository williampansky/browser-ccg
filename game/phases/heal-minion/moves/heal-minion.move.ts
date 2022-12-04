import { Ctx } from 'boardgame.io';
import { add } from 'mathjs';
import { Card, GameState, PlayerID } from '../../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  limitNumberWithinRange,
  pushHealthStreamAndSetDisplay,
} from '../../../../utils';

export interface HealMinionMove {
  cardToHeal: Card;
  ctx: Ctx;
  G: GameState;
  lastPlayedCard: Card;
  player: PlayerID;
  targetPlayer: PlayerID;
  zoneNumber: number;
}

export const healMinion = (
  G: GameState,
  ctx: Ctx,
  cardToHeal: Card,
  lastPlayedCard: Card,
  targetPlayer: PlayerID
) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToHeal)) {
      pushHealthStreamAndSetDisplay(
        c,
        lastPlayedCard,
        lastPlayedCard.numberPrimary,
        limitNumberWithinRange(
          add(c.displayHealth, lastPlayedCard.numberPrimary),
          c.baseHealth,
          lastPlayedCard.numberPrimary
        )
      );
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

import { lte } from 'lodash';
import { subtract } from 'mathjs';
import type { Ctx, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { LastMoveMade } from '../../enums';
import {
  cardUuidMatch,
  determinePlayableCards,
  getContextualPlayerIds,
  handleDestroyedCards,
  pushHealthStreamAndSetDisplay,
  removeLastPlayedCardFromHand,
  resetAttackableMinions,
} from '../../utils';

export interface AttackMinionMove {
  card: Card;
  targetPlayer: PlayerID;
}

export const attackMinionMove = (
  G: GameState,
  ctx: Ctx,
  { card, targetPlayer }: AttackMinionMove
) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);
  const cardToAttack = card;
  const lastCardPlayed = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToAttack)) {
      pushHealthStreamAndSetDisplay(
        c,
        lastCardPlayed,
        lastCardPlayed.numberPrimary,
        subtract(c.displayHealth, lastCardPlayed.numberPrimary)
      );

      if (lte(c.displayHealth, 0)) c.booleans.isDestroyed = true;
    }

    if (cardUuidMatch(c, lastCardPlayed)) {
      c.booleans.onPlayWasTriggered = true;
    }
  };

  G.zones.forEach((z) => {
    z.sides[targetPlayer].forEach((c) => init(c));
    z.sides[opponent].forEach((c) => init(c));
  });

  G.lastMoveMade = LastMoveMade.AttackMinion;
  removeLastPlayedCardFromHand(G, currentPlayer);
  resetAttackableMinions(G, currentPlayer);
  handleDestroyedCards(G, ctx);
  determinePlayableCards(G, ctx, currentPlayer);
  ctx.events?.endStage();
};

export const attackMinion: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { card, targetPlayer }: AttackMinionMove) => {
    return attackMinionMove(G, ctx, { card, targetPlayer });
  },
};

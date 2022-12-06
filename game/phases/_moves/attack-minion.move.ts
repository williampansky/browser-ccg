import { lte } from 'lodash';
import { Ctx } from 'boardgame.io';
import { subtract } from 'mathjs';
import { LastMoveMade } from '../../../enums';
import { Card, GameState, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';
import removeLastPlayedCardFromHand from '../_utils/remove-last-played-card-from-hand';
import { resetAttackableMinions } from '../attack-minion/methods/reset-attackable-minions';
import handleDestroyedCards from '../_utils/handle-destroyed-cards';
import { determinePlayableCards } from '../_utils/determine-playable-cards';

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

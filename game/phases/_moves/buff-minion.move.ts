import { Ctx } from 'boardgame.io';
import { add } from 'mathjs';
import { LastMoveMade } from '../../../enums';
import { Card, GameState, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  limitNumberWithinRange,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';
import { core031Buff } from '../../mechanics/core-mechanics-by-key/mechanic.core.031';
import { core110Buff } from '../../mechanics/core-mechanics-by-key/mechanic.core.110';
import { resetAttackableMinions } from '../attack-minion/methods/reset-attackable-minions';
import { resetBuffableMinions } from '../buff-minion/methods/reset-buffable-minions';
import { determinePlayableCards } from '../_utils/determine-playable-cards';
import handleDestroyedCards from '../_utils/handle-destroyed-cards';
import removeLastPlayedCardFromHand from '../_utils/remove-last-played-card-from-hand';

export interface BuffMinionMove {
  card: Card;
  targetPlayer: PlayerID;
}

export const buffMinionMove = (
  G: GameState,
  ctx: Ctx,
  { card, targetPlayer }: BuffMinionMove
) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);
  const cardToBuff = card;
  const lastCardPlayed = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToBuff)) {
      switch (lastCardPlayed.key) {
        case 'SET_CORE_031':
          core031Buff(G, ctx, targetPlayer, c?.uuid, lastCardPlayed);
          break;
        case 'SET_CORE_110':
          core110Buff(G, ctx, targetPlayer, c?.uuid, lastCardPlayed);
          break;
        default:
          break;
      }
    }

    if (cardUuidMatch(c, lastCardPlayed)) {
      c.booleans.onPlayWasTriggered = true;
    }
  };

  G.zones.forEach((z) => {
    z.sides[targetPlayer].forEach((c) => init(c));
    z.sides[opponent].forEach((c) => init(c));
  });

  G.lastMoveMade = LastMoveMade.BuffMinion;
  removeLastPlayedCardFromHand(G, currentPlayer);
  resetBuffableMinions(G, currentPlayer);
  determinePlayableCards(G, ctx, currentPlayer);
  ctx.events?.endStage();
};

import { add } from 'mathjs';
import type { Ctx, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { LastMoveMade } from '../../enums';
import {
  cardUuidMatch,
  determinePlayableCards,
  getContextualPlayerIds,
  limitNumberWithinRange,
  pushHealthStreamAndSetDisplay,
  removeLastPlayedCardFromHand,
  resetHealableMinions,
} from '../../utils';

export interface HealMinionMove {
  card: Card;
  targetPlayer: PlayerID;
}

export const healMinionMove = (
  G: GameState,
  ctx: Ctx,
  { card, targetPlayer }: HealMinionMove
) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);
  const cardToDestroy = card;
  const lastCardPlayed = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToDestroy)) {
      pushHealthStreamAndSetDisplay(
        c,
        lastCardPlayed,
        lastCardPlayed.numberPrimary,
        limitNumberWithinRange(
          add(c.displayHealth, lastCardPlayed.numberPrimary),
          c.baseHealth,
          lastCardPlayed.numberPrimary
        )
      );
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
  resetHealableMinions(G, currentPlayer);
  determinePlayableCards(G, ctx, currentPlayer);
  ctx.events?.endStage();
};

export const healMinion: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { card, targetPlayer }: HealMinionMove) => {
    return healMinionMove(G, ctx, { card, targetPlayer });
  },
};

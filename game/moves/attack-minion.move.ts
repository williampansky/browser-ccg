import { lte } from 'lodash';
import { subtract } from 'mathjs';
import type { Ctx, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { LastMoveMade } from '../../enums';
import { lastCardPlayed } from '../state';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  handleDestroyedCards,
  pushEventStream,
  pushHealthStreamAndSetDisplay,
  resetAttackableMinions,
  resetCardTargetBooleans,
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
  // const { opponent } = getContextualPlayerIds(currentPlayer);
  const cardToAttack = card;
  const lastCard = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToAttack)) {
      c.booleans.hasHealthReduced = true;
      pushEventStream(c, lastCard, 'wasAttacked');
      pushHealthStreamAndSetDisplay(
        c,
        lastCard,
        -lastCard.numberPrimary,
        subtract(c.displayHealth, lastCard.numberPrimary)
      );

      if (lte(c.displayHealth, 0)) {
        c.booleans.isDestroyed = true;
        c.destroyedOnTurn = G.turn;
      }
    }

    if (cardUuidMatch(c, lastCard)) {
      c.booleans.onPlayWasTriggered = true;
      pushEventStream(c, cardToAttack, 'onPlayWasTriggered');
    }
  };

  G.zones.forEach((z) => {
    z.sides[currentPlayer].forEach((c) => init(c));
    z.sides[targetPlayer].forEach((c) => init(c));
  });

  G.lastMoveMade = LastMoveMade.AttackMinion;
  handleDestroyedCards(G, ctx);
  resetCardTargetBooleans(G, ctx);
  // resetAttackableMinions(G, currentPlayer);
  lastCardPlayed.reset(G);
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

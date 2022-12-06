import type { Ctx, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { LastMoveMade } from '../../enums';
import {
  cardUuidMatch,
  determinePlayableCards,
  getContextualPlayerIds,
  handleDestroyedCards,
  removeLastPlayedCardFromHand,
  resetDestroyableMinions,
} from '../../utils';

export interface DestroyMinionMove {
  card: Card;
  targetPlayer: PlayerID;
}

export const destroyMinionMove = (
  G: GameState,
  ctx: Ctx,
  { card, targetPlayer }: DestroyMinionMove
) => {
  const { currentPlayer } = ctx;
  const { opponent } = getContextualPlayerIds(currentPlayer);
  const cardToDestroy = card;
  const lastCardPlayed = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToDestroy)) {
      c.booleans.isDestroyed = true;
      c.booleans.canBeDestroyed = false;
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
  resetDestroyableMinions(G, currentPlayer);
  handleDestroyedCards(G, ctx);
  determinePlayableCards(G, ctx, currentPlayer);
  ctx.events?.endStage();
};

export const destroyMinion: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { card, targetPlayer }: DestroyMinionMove) => {
    return destroyMinionMove(G, ctx, { card, targetPlayer });
  },
};

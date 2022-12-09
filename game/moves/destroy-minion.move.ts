import type { Ctx, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { LastMoveMade } from '../../enums';
import { lastCardPlayed } from '../state';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  handleDestroyedCards,
  initActivateEventListeners,
  pushEventStream,
  resetCardTargetBooleans,
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
  // const { opponent } = getContextualPlayerIds(currentPlayer);
  const cardToDestroy = card;
  const lastCard = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToDestroy)) {
      c.destroyedOnTurn = G.turn;
      c.booleans.isDestroyed = true;
      c.booleans.canBeDestroyed = false;
      pushEventStream(c, lastCard, 'wasDestroyed');
    }

    if (cardUuidMatch(c, lastCard)) {
      c.booleans.onPlayWasTriggered = true;
      pushEventStream(c, cardToDestroy, 'onPlayWasTriggered');
    }
  };

  G.zones.forEach((z) => {
    z.sides[currentPlayer].forEach((c) => init(c));
    z.sides[targetPlayer].forEach((c) => init(c));
  });

  G.lastMoveMade = LastMoveMade.DestroyMinion;
  handleDestroyedCards(G, ctx);
  initActivateEventListeners(G, ctx);
  resetCardTargetBooleans(G, ctx);
  // resetDestroyableMinions(G, currentPlayer);
  lastCardPlayed.reset(G);
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

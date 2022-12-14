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
import core126 from '../mechanics/core-mechanics-by-key/mechanic.core.126';

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
  const { opponent, player } = getContextualPlayerIds(currentPlayer);
  const cardToDestroy = card;
  const lastCard = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToDestroy)) {
      switch (lastCard.key) {
        case 'SET_CORE_043':
        case 'SET_CORE_126':
          core126.exec(G, ctx, targetPlayer, c, lastCard);
          break;

        default:
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
          break;
      }
    }
  };

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => init(c));
    z.sides[opponent].forEach((c) => init(c));
  });

  G.lastMoveMade = LastMoveMade.DestroyMinion;
  handleDestroyedCards(G, ctx);
  initActivateEventListeners(G, ctx);
  resetCardTargetBooleans(G, ctx);
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

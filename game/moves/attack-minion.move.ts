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
} from '../../utils';

import { core050, core058 } from '../mechanics';

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
  const { opponent, player } = getContextualPlayerIds(currentPlayer);
  const cardToAttack = card;
  const lastCard = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToAttack)) {
      switch (lastCard.key) {
        case 'SET_CORE_050':
          return core050.exec(G, targetPlayer, c, lastCard);
        case 'SET_CORE_058':
          return core058.exec(G, targetPlayer, c, lastCard);
        default:
          if (cardUuidMatch(c, cardToAttack)) {
            c.booleans.hasHealthReduced = true;
            pushEventStream(c, lastCard, 'wasAttacked');
            pushHealthStreamAndSetDisplay(
              c,
              lastCard,
              -lastCard.numberPrimary,
              subtract(c.displayHealth, lastCard.numberPrimary)
            );
          }
          return;
      }
    }
  };

  const check = (c: Card) => {
    if (lte(c.displayHealth, 0)) {
      c.booleans.isDestroyed = true;
      c.destroyedOnTurn = G.turn;
    }

    if (cardUuidMatch(c, lastCard)) {
      c.booleans.onPlayWasTriggered = true;
      pushEventStream(c, c, 'onPlayWasTriggered');
    }
  };

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => init(c));
    z.sides[opponent].forEach((c) => init(c));
  });

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => check(c));
    z.sides[opponent].forEach((c) => check(c));
  });

  G.lastMoveMade = LastMoveMade.AttackMinion;
  handleDestroyedCards(G, ctx);
  resetAttackableMinions(G, currentPlayer);
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

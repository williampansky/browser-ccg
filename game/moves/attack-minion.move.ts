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

import core050 from '../mechanics/core-mechanics-by-key/mechanic.core.050';
import core058 from '../mechanics/core-mechanics-by-key/mechanic.core.058';
import core053 from '../mechanics/core-mechanics-by-key/mechanic.core.053';

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
        case 'SET_CORE_053':
          core053.exec(G, ctx, targetPlayer, c, lastCard);
          break;
        case 'SET_CORE_050':
          core050.exec(G, targetPlayer, c, lastCard);
          break;
        case 'SET_CORE_058':
          core058.exec(G, targetPlayer, c, lastCard);
          break;
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
          break;
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

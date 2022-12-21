import { lte } from 'lodash';
import type { Ctx, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { LastMoveMade } from '../../enums';
import { lastCardPlayed } from '../state';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  handleDestroyedCards,
  pushEventStream,
  resetCardTargetBooleans,
} from '../../utils';

import core056 from '../mechanics/core-mechanics-by-key/mechanic.core.056';

export interface DebuffMinionMove {
  card: Card;
  targetPlayer: PlayerID;
}

export const debuffMinionMove = (
  G: GameState,
  ctx: Ctx,
  { card, targetPlayer }: DebuffMinionMove
) => {
  const { currentPlayer } = ctx;
  const { opponent, player } = getContextualPlayerIds(currentPlayer);
  const cardToAttack = card;
  const lastCard = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToAttack)) {
      switch (lastCard.key) {
        case 'SET_CORE_056':
          return core056.exec(G, targetPlayer, c, lastCard);
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

  G.lastMoveMade = LastMoveMade.DebuffMinion;
  handleDestroyedCards(G, ctx);
  resetCardTargetBooleans(G, ctx);
  lastCardPlayed.reset(G);
  ctx.events?.endStage();
};

export const debuffMinion: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { card, targetPlayer }: DebuffMinionMove) => {
    return debuffMinionMove(G, ctx, { card, targetPlayer });
  },
};

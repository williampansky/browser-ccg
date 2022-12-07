import type { Ctx, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { LastMoveMade } from '../../enums';
import { lastCardPlayed } from '../state';
import { core031Buff } from '../mechanics/core-mechanics-by-key/mechanic.core.031';
import { core110Buff } from '../mechanics/core-mechanics-by-key/mechanic.core.110';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  resetBuffableMinions,
} from '../../utils';

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
  const lastCard = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToBuff)) {
      switch (lastCard.key) {
        case 'SET_CORE_031':
          core031Buff(G, ctx, targetPlayer, c?.uuid, lastCard);
          break;
        case 'SET_CORE_110':
          core110Buff(G, ctx, targetPlayer, c?.uuid, lastCard);
          break;
        default:
          break;
      }
    }

    if (cardUuidMatch(c, lastCard)) {
      c.booleans.onPlayWasTriggered = true;
    }
  };

  G.zones.forEach((z) => {
    z.sides[targetPlayer].forEach((c) => init(c));
    z.sides[opponent].forEach((c) => init(c));
  });

  G.lastMoveMade = LastMoveMade.BuffMinion;
  resetBuffableMinions(G, currentPlayer);
  lastCardPlayed.reset(G);
  ctx.events?.endStage();
};

export const buffMinion: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { card, targetPlayer }: BuffMinionMove) => {
    return buffMinionMove(G, ctx, { card, targetPlayer });
  },
};

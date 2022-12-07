import { add } from 'mathjs';
import { current } from 'immer';
import type { Ctx, LongFormMove } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../types';
import { LastMoveMade } from '../../enums';
import { lastCardPlayed } from '../state';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  limitNumberWithinRange,
  pushEventStream,
  pushHealthStreamAndSetDisplay,
  resetCardTargetBooleans,
  resetHealableMinions,
} from '../../utils';
import { activateAnyEventListeners } from '../phases/play-card/play-card.turn.on-move';

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
  const cardToHeal = card;
  const lastCard = G.lastCardPlayed?.card!;

  const init = (c: Card) => {
    if (cardUuidMatch(c, cardToHeal)) {
      c.booleans.wasHealed = true;
      pushEventStream(c, lastCard, 'wasHealed');
      pushHealthStreamAndSetDisplay(
        c,
        lastCard,
        lastCard.numberPrimary,
        limitNumberWithinRange(
          add(c.displayHealth, lastCard.numberPrimary),
          c.baseHealth,
          lastCard.numberPrimary
        )
      );
    }

    if (cardUuidMatch(c, lastCard)) {
      c.booleans.onPlayWasTriggered = true;
      pushEventStream(c, cardToHeal, 'onPlayWasTriggered');
    }
  };

  G.zones.forEach((z) => {
    z.sides[targetPlayer].forEach((c) => init(c));
    z.sides[opponent].forEach((c) => init(c));
  });

  G.lastMoveMade = LastMoveMade.HealMinion;
  activateAnyEventListeners(G, ctx);
  resetHealableMinions(G, currentPlayer);
  lastCardPlayed.reset(G);
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

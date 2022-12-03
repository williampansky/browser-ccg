import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { counts } from '../../state';
import {
  cardIsMinion,
  filterArray,
  getContextualPlayerIds,
  handleCardDestructionMechanics,
} from '../../../utils';

export const aiOnPlayDestroy = (G: GameState, ctx: Ctx, aiID: PlayerID) => {
  const { opponent } = getContextualPlayerIds(aiID);
  let possibleTargets: {
    zoneNumber: number;
    cardData: Card;
    cardIndex: number;
  }[] = [];

  G.zones.forEach((z, zIdx) => {
    z.sides[opponent].forEach((c, cIdx) => {
      if (cardIsMinion(c)) {
        possibleTargets.push({
          zoneNumber: zIdx,
          cardData: c,
          cardIndex: cIdx,
        });
      }
    });
  });

  if (possibleTargets.length !== 0) {
    // get a random one from the list
    const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;

    G.players[opponent].cards.destroyed.push(choice.cardData);

    counts.incrementDestroyed(G, opponent);

    filterArray(
      G.zones[choice.zoneNumber].sides[opponent],
      choice.cardData.uuid,
      choice.cardIndex
    );

    handleCardDestructionMechanics(G, choice.cardData, opponent);

  }
};

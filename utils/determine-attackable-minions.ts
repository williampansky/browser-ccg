import { GameState, PlayerID } from '../types';
import { cardIsNotSelf, getContextualPlayerIds } from '.';

const determineAttackableMinions = (G: GameState, player: PlayerID) => {
  const { opponent } = getContextualPlayerIds(player);
  const lastCardPlayed = G.lastCardPlayed.card!;

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      const cardIsNotDestroyed = c.booleans.isDestroyed === false;
      if (cardIsNotSelf(c, lastCardPlayed) && cardIsNotDestroyed) {
        c.booleans.canBeAttackedBySpell = true;
      }
    });

    z.sides[opponent].forEach((c) => {
      const cardIsNotDestroyed = c.booleans.isDestroyed === false;
      if (cardIsNotSelf(c, lastCardPlayed) && cardIsNotDestroyed) {
        c.booleans.canBeAttackedBySpell = true;
      }
    });
  });
};

export default determineAttackableMinions;

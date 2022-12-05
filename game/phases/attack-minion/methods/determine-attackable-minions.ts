import { GameState, PlayerID } from '../../../../types';
import { cardIsNotSelf, getContextualPlayerIds } from '../../../../utils';

export const determineAttackableMinions = (
  G: GameState,
  player: PlayerID,
  callback?: (G: GameState) => void
) => {
  const { opponent } = getContextualPlayerIds(player);
  const lastCardPlayed = G.lastCardPlayed.card!;

  G.zones.forEach((z) => {
    z.sides[opponent].forEach((c) => {
      if (cardIsNotSelf(c, lastCardPlayed) && c.booleans.isDestroyed === false) {
        c.booleans.canBeAttackedBySpell = true;
        // switch (lastCardPlayed.key) {
        //   case 'SET_CORE_060':
        //     if (c.booleans.hasHealthReduced) {
        //       c.booleans.canBeAttackedBySpell = true;
        //     }
        //     break;

        //   default:
        //     c.booleans.canBeAttackedBySpell = true;
        //     break;
        // }
      }
    });

    // @todo future enhancement - enable self attacks
  });

  if (callback) return callback;
};

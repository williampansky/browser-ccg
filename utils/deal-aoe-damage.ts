import { subtract } from 'mathjs';
import { Card, GameState, PlayerID } from '../types';
import getContextualPlayerIds from './get-contextual-player-ids';
import pushHealthStreamAndSetDisplay from './push-healthstream-and-set-display';

const dealAoeDamage = (
  G: GameState,
  player: PlayerID,
  cardToBlame: Card,
  targetPlayer?: PlayerID
) => {
  const { numberPrimary } = cardToBlame;
  const { opponent } = getContextualPlayerIds(player);
  const context = () => (targetPlayer ? 'targeted' : 'both');

  switch (context()) {
    case 'targeted':
      G.zones.forEach((z) => {
        z.sides[targetPlayer!].forEach((c) => {
          pushHealthStreamAndSetDisplay(
            c,
            cardToBlame,
            numberPrimary,
            subtract(c.displayHealth, numberPrimary)
          );
        });
      });
      break;

    case 'both':
    default:
      G.zones.forEach((z) => {
        z.sides[player].forEach((c) => {
          pushHealthStreamAndSetDisplay(
            c,
            cardToBlame,
            numberPrimary,
            subtract(c.displayHealth, numberPrimary)
          );
        });

        z.sides[opponent].forEach((c) => {
          pushHealthStreamAndSetDisplay(
            c,
            cardToBlame,
            numberPrimary,
            subtract(c.displayHealth, numberPrimary)
          );
        });
      });
      break;
  }
};

export default dealAoeDamage;

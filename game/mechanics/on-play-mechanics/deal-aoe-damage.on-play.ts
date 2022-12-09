import { subtract } from 'mathjs';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  cardIsNotSelf,
  cardUuidMatch,
  getContextualPlayerIds,
  pushEventStream,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

const dealAoeDamageOnPlay = (G: GameState, player: PlayerID, card: Card) => {
  const { numberPrimary } = card;
  const { opponent } = getContextualPlayerIds(player);
  let setOnPlayWasTriggered: boolean = false;

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (cardIsNotSelf(c, card) && !c.booleans.isDestroyed) {
        setOnPlayWasTriggered = true;
        c.booleans.hasHealthReduced = true;
        pushHealthStreamAndSetDisplay(
          c,
          card,
          numberPrimary,
          subtract(c.displayHealth, numberPrimary)
        );
      }
    });

    z.sides[opponent].forEach((c) => {
      if (cardIsNotSelf(c, card) && !c.booleans.isDestroyed) {
        setOnPlayWasTriggered = true;
        c.booleans.hasHealthReduced = true;
        pushHealthStreamAndSetDisplay(
          c,
          card,
          numberPrimary,
          subtract(c.displayHealth, numberPrimary)
        );
      }
    });
  });

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (cardUuidMatch(c, card) && setOnPlayWasTriggered === true) {
        c.booleans.onPlayWasTriggered = true;
        pushEventStream(c, c, 'onPlayWasTriggered');
      }
    });
  });
};

export default dealAoeDamageOnPlay;

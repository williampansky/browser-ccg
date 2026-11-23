import { defineCard } from '../define-card';
import { returnToHand } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_198, Combo: "Return a minion to its owner's hand". It only asks for a
// target when you have already played a card this turn.
export default defineCard('PRIME_198', () => ({
  combo: {
    target: anyMinion(),
    effects: [returnToHand(chosenTarget(), 0, false, true)],
  },
}));

import { defineCard, on } from '../define-card';
import { addCardToHand } from '../../effects/primitives';

// The Dream cards (PRIME_109a to PRIME_109d), one of which is added at random
const DREAMS = ['PRIME_109a', 'PRIME_109b', 'PRIME_109c', 'PRIME_109d'];

// PRIME_109: "At the end of your turn, add a Dream Card to your hand"
export default defineCard('PRIME_109', () => ({
  triggers: [
    on('TurnEnded', {
      when: (event, info) => event.player === info.owner,
      do: [addCardToHand((ctx) => DREAMS[ctx.rng.int(DREAMS.length)])],
    }),
  ],
}));

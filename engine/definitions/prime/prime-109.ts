import { defineCard, on } from '../define-card';
import { addCardToHand } from '../../effects/primitives';

// The Dream cards (GAME_014 to 017), one of which is added at random
const DREAMS = ['GAME_014', 'GAME_015', 'GAME_016', 'GAME_017'];

// PRIME_109: "At the end of your turn, add a Dream Card to your hand"
export default defineCard('PRIME_109', () => ({
  triggers: [
    on('TurnEnded', {
      when: (event, info) => event.player === info.owner,
      do: [addCardToHand((ctx) => DREAMS[ctx.rng.int(DREAMS.length)])],
    }),
  ],
}));

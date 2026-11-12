import { defineCard, on } from '../define-card';
import { draw } from '../../effects/primitives';

// PRIME_210 Well of Infinite Tidings: "Draw a card at the end of your turn"
export default defineCard('PRIME_210', (n) => ({
  triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [draw(n.primary)] })],
}));

import { defineCard, on } from '../define-card';
import { draw, withChance } from '../../effects/primitives';

// PRIME_090 Appa: "At the start of your turn, there's a chance for you to draw another card" (1 in 2)
export default defineCard('PRIME_090', () => ({
  triggers: [on('TurnStarted', { when: (e, c) => e.player === c.owner, do: [withChance(0.5, draw(1))] })],
}));

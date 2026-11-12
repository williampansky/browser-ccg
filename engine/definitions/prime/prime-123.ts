import { defineCard } from '../define-card';
import { draw, heal } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// PRIME_123 Maven of Renewed Spirit: "Select One: Draw 2 cards; or Heal 5 Health" (your hero; the text names no target)
export default defineCard('PRIME_123', (n) => ({
  choices: [
    { label: 'Draw 2 cards', onPlay: [draw(2)] },
    { label: `Heal ${n.primary} Health`, onPlay: [heal(ownHero(), n.primary)] },
  ],
}));

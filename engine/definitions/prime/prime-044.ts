import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_044 Mutating Sprite: "Gain +1/+1 whenever a Sprite dies" (any Sprite, either side)
export default defineCard('PRIME_044', () => ({
  triggers: [on('MinionDied', { when: (e, c) => c.catalog.get(e.cardId)?.race === 'SPRITE', do: [buff(self(), 1, 1)] })],
}));

import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_045 Void Harnesser: "Gain +1/+1 any time a Mystery card is played" (either player's)
export default defineCard('PRIME_045', () => ({
  triggers: [on('CardPlayed', { when: (e) => !!e.mystery, do: [buff(self(), 1, 1)] })],
}));

import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_205 Nature's Fury: "Whenever any player plays an Overcharge card, gain +1/+1" (yours or the opponent's)
export default defineCard('PRIME_205', (n) => ({
  triggers: [on('OverchargeGained', { do: [buff(self(), n.primary, n.secondary)] })],
}));

import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_205 Nature's Fury: "Whenever you play an Overcharge card, gain +1/+1"
export default defineCard('PRIME_205', (n) => ({
  triggers: [on('OverchargeGained', { when: (e, c) => e.player === c.owner, do: [buff(self(), n.primary, n.secondary)] })],
}));

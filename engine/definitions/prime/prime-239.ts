import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_239 Desert Rider: "Whenever a minion takes damage, gain +1 Attack" (any minion, either side, itself too)
export default defineCard('PRIME_239', (n) => ({
  triggers: [on('MinionDamaged', { do: [buff(self(), n.primary, 0)] })],
}));

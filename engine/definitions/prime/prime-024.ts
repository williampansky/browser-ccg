import { defineCard, on } from '../define-card';
import { heal } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_024 Deep Diver: "Guard. Heals 1 each time it is damaged"
export default defineCard('PRIME_024', () => ({
  triggers: [on('MinionDamaged', { when: (e, c) => e.instanceId === c.selfId, do: [heal(self(), 1)] })],
}));

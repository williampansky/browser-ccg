import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_041 Crazy Imp: "Gains +1 Attack each time it is damaged" (it keeps it)
export default defineCard('PRIME_041', (n) => ({
  triggers: [on('MinionDamaged', { when: (e, c) => e.instanceId === c.selfId, do: [buff(self(), n.primary, 0)] })],
}));

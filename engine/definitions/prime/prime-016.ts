import { defineCard, on } from '../define-card';
import { draw } from '../../effects/primitives';

// PRIME_016 Barracks: "Draw a card anytime this minion incurs damage"
export default defineCard('PRIME_016', () => ({
  triggers: [on('MinionDamaged', { when: (e, c) => e.instanceId === c.selfId, do: [draw(1)] })],
}));

import { defineCard, on } from '../define-card';
import { damage, destroy } from '../../effects/primitives';
import { allMinions, self } from '../../effects/selectors';

// PRIME_078 Infernal Nest (0/7): "At the start of your next turn, deal 4 damage to ALL minions, then this dies"
export default defineCard('PRIME_078', () => ({
  triggers: [on('TurnStarted', { when: (e, c) => e.player === c.owner, do: [damage(allMinions(), 4), destroy(self())] })],
}));

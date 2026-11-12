import { defineCard, on } from '../define-card';
import { buffThisTurn } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_239 Desert Rider: "Whenever an enemy minion takes damage, gain +1 Attack this turn"
export default defineCard('PRIME_239', (n) => ({
  triggers: [on('MinionDamaged', { when: (e, c) => e.player !== c.owner, do: [buffThisTurn(self(), n.primary)] })],
}));

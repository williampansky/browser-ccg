import { defineCard, on } from '../define-card';
import { damage } from '../../effects/primitives';
import { randomEnemies } from '../../effects/selectors';

// PRIME_245 Nuclear Submarine: "Can't Attack. At the end of your turn, deal 8 damage to a Random enemy" (a minion or the hero)
export default defineCard('PRIME_245', (n) => ({
  triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [damage(randomEnemies(n.random), n.primary)] })],
}));

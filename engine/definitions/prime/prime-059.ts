import { defineCard, on } from '../define-card';
import { damage } from '../../effects/primitives';
import { randomEnemies } from '../../effects/selectors';

// PRIME_059 Watchtower: "At the start of your turn, deal 2 damage to a Random enemy" (hero included)
export default defineCard('PRIME_059', (n) => ({
  triggers: [on('TurnStarted', { when: (e, c) => e.player === c.owner, do: [damage(randomEnemies(n.random), n.primary)] })],
}));

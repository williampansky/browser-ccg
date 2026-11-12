import { defineCard, on } from '../define-card';
import { damage } from '../../effects/primitives';
import { everyoneElse } from '../../effects/selectors';

// PRIME_102 Jotunn: "At the end of your turn, deal 2 damage to ALL other characters"
export default defineCard('PRIME_102', (n) => ({
  triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [damage(everyoneElse(), n.primary)] })],
}));

import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { randomFriendlyMinions } from '../../effects/selectors';

// PRIME_215 Mushroomer: "Concealed. At the end of your turn, give a random friendly minion +1 Health" (may be itself)
export default defineCard('PRIME_215', (n) => ({
  triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [buff(randomFriendlyMinions(1), 0, n.primary)] })],
}));

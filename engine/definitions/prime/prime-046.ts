import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { randomFriendlyMinions } from '../../effects/selectors';

// PRIME_046 Tavern: "At the end of your turn, give a Random friendly minion +1 Health" (may be the Tavern itself)
export default defineCard('PRIME_046', (n) => ({
  triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [buff(randomFriendlyMinions(n.random), 0, n.primary)] })],
}));

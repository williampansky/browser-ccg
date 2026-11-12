import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { randomFriendlyMinions } from '../../effects/selectors';

// PRIME_052 Weapon's Cart: "At the end of your turn, give a Random friendly minion +1 Attack" (may be the Cart itself)
export default defineCard('PRIME_052', (n) => ({
  triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [buff(randomFriendlyMinions(n.random), n.primary, 0)] })],
}));

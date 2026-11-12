import { defineCard, on } from '../define-card';
import { heal } from '../../effects/primitives';
import { randomFriendlyMinions } from '../../effects/selectors';

// PRIME_176 Shaman Wudu: "Heal a Random friendly damaged minion for 3 Health at the end of your turn"
export default defineCard('PRIME_176', (n) => ({
  triggers: [
    on('TurnEnded', {
      when: (e, c) => e.player === c.owner,
      do: [heal(randomFriendlyMinions(n.random, (m) => m.health < m.maxHealth), n.primary)],
    }),
  ],
}));

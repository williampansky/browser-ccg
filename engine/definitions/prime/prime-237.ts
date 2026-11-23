import { defineCard, on } from '../define-card';
import { heal } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// PRIME_237 Soulharvester: "Heal 2 HP whenever a friendly minion dies"
export default defineCard('PRIME_237', (n) => ({
  triggers: [
    on('MinionDied', {
      when: (e, c) => e.player === c.owner,
      do: [heal(ownHero(), n.primary)],
    }),
  ],
}));

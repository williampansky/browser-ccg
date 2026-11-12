import { defineCard, on } from '../define-card';
import { heal } from '../../effects/primitives';
import { randomFriendlyMinions } from '../../effects/selectors';

// PRIME_093 Cleric of Shaho: "After you summon a minion, heal 2 Health to a Random friendly minion" (not for itself)
export default defineCard('PRIME_093', (n) => ({
  triggers: [
    on('MinionSummoned', { when: (e, c) => e.player === c.owner && e.instanceId !== c.selfId, do: [heal(randomFriendlyMinions(n.random), n.primary)] }),
  ],
}));

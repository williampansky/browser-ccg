import { defineCard, on } from '../define-card';
import { buff, computed } from '../../effects/primitives';
import { randomFriendlyMinions } from '../../effects/selectors';

// PRIME_215 Mushroomer: "Concealed. At the end of your turn, give another random friendly minion +1 Health"
// (never itself, as the author asked in playtest 2026-11-12; with no other minion it does nothing)
export default defineCard('PRIME_215', (n) => ({
  triggers: [
    on('TurnEnded', {
      when: (e, c) => e.player === c.owner,
      do: [computed((ctx) => buff(randomFriendlyMinions(1, (m) => m.instanceId !== ctx.self), 0, n.primary))],
    }),
  ],
}));

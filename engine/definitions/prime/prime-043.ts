import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_043 Tra'an Guard: "Whenever your characters are healed, gain +1/+1" (your hero or your minions; not the opponent's)
export default defineCard('PRIME_043', (n) => ({
  triggers: [
    on('Healed', {
      when: (e, c) =>
        e.target.kind === 'hero'
          ? e.target.player === c.owner
          : c.state.players[c.owner].board.some((m) => e.target.kind === 'minion' && m.instanceId === e.target.instanceId),
      do: [buff(self(), n.primary, n.primary)],
    }),
  ],
}));

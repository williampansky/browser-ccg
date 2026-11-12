import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_141 Fierce Gremlin: "Whenever you cast a spell, gain +1 Attack"
export default defineCard('PRIME_141', (n) => ({
  triggers: [
    on('CardPlayed', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.type === 'spell',
      do: [buff(self(), n.primary, 0)],
    }),
  ],
}));

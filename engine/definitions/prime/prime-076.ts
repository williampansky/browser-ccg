import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_076 Spellwolf: "Gain +2/+2 every time you cast a spell"
export default defineCard('PRIME_076', () => ({
  triggers: [
    on('CardPlayed', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.type === 'spell',
      do: [buff(self(), 2, 2)],
    }),
  ],
}));

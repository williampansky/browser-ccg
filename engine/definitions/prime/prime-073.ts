import { defineCard, on } from '../define-card';
import { draw } from '../../effects/primitives';

// PRIME_073 Wandering Mystic: "Draw a card, whenever you cast a spell"
export default defineCard('PRIME_073', (n) => ({
  triggers: [
    on('CardPlayed', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.type === 'spell',
      do: [draw(n.primary)],
    }),
  ],
}));

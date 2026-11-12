import { defineCard, on } from '../define-card';
import { copyPlayedSpellToOtherHand } from '../../effects/primitives';

// PRIME_088 The Nameless Traveler: "Whenever anyone plays a spell card, add a copy to the other hand" (to the OTHER player than the caster; a Mystery placed face down is not copied)
export default defineCard('PRIME_088', () => ({
  triggers: [
    on('CardPlayed', {
      when: (e, c) => !e.mystery && c.catalog.get(e.cardId)?.type === 'spell',
      do: [copyPlayedSpellToOtherHand()],
    }),
  ],
}));

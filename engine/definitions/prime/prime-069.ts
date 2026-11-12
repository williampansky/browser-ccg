import { defineCard, on } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_069 Spider King: "Summon a 1/1 Spider anytime you cast a spell"
export default defineCard('PRIME_069', () => ({
  triggers: [
    on('CardPlayed', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.type === 'spell',
      do: [summonEntourage()],
    }),
  ],
}));

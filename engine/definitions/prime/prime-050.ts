import { defineCard, on } from '../define-card';
import { buffThisTurn } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_050 Crazed Imp: "Boon: +2 Attack this turn if you cast a spell" (each spell you cast; lasts until your turn ends)
export default defineCard('PRIME_050', (n) => ({
  triggers: [
    on('CardPlayed', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.type === 'spell',
      do: [buffThisTurn(self(), n.primary)],
    }),
  ],
}));

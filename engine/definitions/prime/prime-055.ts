import { defineCard, on } from '../define-card';
import { damage } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

// PRIME_055 Suicidal Wizard: "After you cast a spell, deal 1 damage to ALL minions"
export default defineCard('PRIME_055', (n) => ({
  triggers: [
    on('CardPlayed', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.type === 'spell',
      do: [damage(allMinions(), n.primary)],
    }),
  ],
}));

import { defineCard, on } from '../define-card';
import { damage } from '../../effects/primitives';
import { allEnemyMinions } from '../../effects/selectors';

// PRIME_055 Suicidal Wizard (2/3): "After you cast a spell, deal 1 damage to all enemy minions"
export default defineCard('PRIME_055', (n) => ({
  triggers: [
    on('CardPlayed', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.type === 'spell',
      do: [damage(allEnemyMinions(), n.primary)],
    }),
  ],
}));

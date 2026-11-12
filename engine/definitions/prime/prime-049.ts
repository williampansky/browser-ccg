import { defineCard, on } from '../define-card';
import { damage } from '../../effects/primitives';
import { randomEnemyMinions } from '../../effects/selectors';

// PRIME_049 Fiery Axe Thrower (2/2): "After you summon a minion, deal 1 damage to a random enemy minion" (not for itself)
export default defineCard('PRIME_049', (n) => ({
  triggers: [
    on('MinionSummoned', { when: (e, c) => e.player === c.owner && e.instanceId !== c.selfId, do: [damage(randomEnemyMinions(1), n.primary)] }),
  ],
}));

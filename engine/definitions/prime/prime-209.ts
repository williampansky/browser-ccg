import { defineCard } from '../define-card';
import { damage, disableWhere } from '../../effects/primitives';
import { allEnemyMinions } from '../../effects/selectors';

// PRIME_209 Blaze Storm: "Deal 2 damage to all enemy minions, then Disable any left with 1 Health. Overcharge (2)"
export default defineCard('PRIME_209', (n) => ({
  onPlay: [damage(allEnemyMinions(), n.primary), disableWhere(allEnemyMinions(), (m) => m.health === 1)],
}));

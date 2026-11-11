import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { allEnemyMinions } from '../../effects/selectors';

// CORE_065: "Deal 1 damage to all enemy minions"
export default defineCard('CORE_065', (n) => ({
  onPlay: [damage(allEnemyMinions(), n.primary)],
}));

import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { allEnemyMinions } from '../../effects/selectors';

// CORE_072 spell: "Deal 4 damage to every enemy minion"
export default defineCard('CORE_072', (n) => ({
  onPlay: [damage(allEnemyMinions(), n.primary)],
}));

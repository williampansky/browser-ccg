import { defineCard } from '../define-card';
import { damage, draw } from '../../effects/primitives';
import { allEnemyMinions } from '../../effects/selectors';

// CORE_098 spell: "Deal 1 damage to all enemy minions and draw a card" (one card; hsclone drew N)
export default defineCard('CORE_098', (n) => ({
  onPlay: [damage(allEnemyMinions(), n.primary), draw(1)],
}));

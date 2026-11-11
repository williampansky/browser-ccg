import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { randomEnemyMinions } from '../../effects/selectors';

// CORE_125 spell: "Attack 2 Random enemy minions for 2 damage" (distinct minions; hsclone hit only one)
export default defineCard('CORE_125', (n) => ({
  onPlay: [damage(randomEnemyMinions(n.random), n.primary)],
}));

import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { allEnemies } from '../../effects/selectors';

// CORE_079 spell: "Deal 2 damage to all enemies" (hero and minions)
export default defineCard('CORE_079', (n) => ({
  onPlay: [damage(allEnemies(), n.primary)],
}));

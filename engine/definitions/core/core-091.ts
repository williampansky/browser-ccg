import { defineCard } from '../define-card';
import { damage, heal } from '../../effects/primitives';
import { allEnemies, allFriendlies } from '../../effects/selectors';

// CORE_091 spell: "Deal 2 damage to all enemies and +2 HP to all friendlies"
export default defineCard('CORE_091', (n) => ({
  onPlay: [damage(allEnemies(), n.primary), heal(allFriendlies(), n.secondary)],
}));

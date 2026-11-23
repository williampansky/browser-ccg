import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { enemyHero } from '../../effects/selectors';

// CORE_133 Blistercap, Demise: "Deal 2 damage to the enemy's hero"
export default defineCard('CORE_133', (n) => ({
  onDeath: [damage(enemyHero(), n.primary)],
}));

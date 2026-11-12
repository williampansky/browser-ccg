import { defineCard } from '../define-card';
import { computed, damage } from '../../effects/primitives';
import { enemyHero, randomEnemyMinions } from '../../effects/selectors';

// PRIME_004 Soul Miner, Demise: "Deal 2 damage to a Random enemy minion, or the enemy hero if there is none"
export default defineCard('PRIME_004', (n) => ({
  onDeath: [computed((ctx) => damage(randomEnemyMinions(1)(ctx).length > 0 ? randomEnemyMinions(1) : enemyHero(), n.primary))],
}));

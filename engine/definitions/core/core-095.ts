import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { enemyHero } from '../../effects/selectors';

// CORE_095: "Deal 3 damage to the enemy player"
export default defineCard('CORE_095', (n) => ({
  onPlay: [damage(enemyHero(), n.primary)],
}));

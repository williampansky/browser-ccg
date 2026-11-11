import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { randomEnemies } from '../../effects/selectors';

// CORE_063 Fireballs: "Deal 1 damage to three random enemies"
export default defineCard('CORE_063', (n) => ({
  onPlay: [damage(randomEnemies(n.random), n.primary)],
}));

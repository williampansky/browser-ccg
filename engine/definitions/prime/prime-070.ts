import { defineCard } from '../define-card';
import { damage, grantKeyword } from '../../effects/primitives';
import { allEnemies, friendlyMinions } from '../../effects/selectors';

// PRIME_070 Rusted Warden, Guard. Demise: "Deal 2 damage to all enemies; your minions get Bubble" (enemies = their minions and hero)
export default defineCard('PRIME_070', (n) => ({
  onDeath: [damage(allEnemies(), n.primary), grantKeyword(friendlyMinions(), 'bubble')],
}));

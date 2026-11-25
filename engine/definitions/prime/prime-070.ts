import { defineCard } from '../define-card';
import { damage, grantKeyword } from '../../effects/primitives';
import { allEnemies, friendlyMinions } from '../../effects/selectors';

// PRIME_070 Rusted Warden, Guard. On Death: "Deal 2 damage to all enemies; your
// minions get Bubble" (enemies = their minions and hero). Bubble is in its
// mechanics because it grants it, not because it has it.
export default defineCard('PRIME_070', (n) => ({
  conditionalKeywords: ['bubble'],
  onDeath: [
    damage(allEnemies(), n.primary),
    grantKeyword(friendlyMinions(), 'bubble'),
  ],
}));

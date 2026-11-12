import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { allEnemies } from '../../effects/selectors';

// PRIME_209 Blaze Storm: "Deal 2 damage to all enemies; Overcharge (3)" (enemies = their minions and their hero)
export default defineCard('PRIME_209', (n) => ({ onPlay: [damage(allEnemies(), n.primary)] }));

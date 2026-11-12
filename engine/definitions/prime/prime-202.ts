import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { randomEnemies } from '../../effects/selectors';

// PRIME_202 Divine Force: "Deal 3 damage to a Random enemy. Overcharge (1)" (a minion or the hero)
export default defineCard('PRIME_202', (n) => ({ onPlay: [damage(randomEnemies(n.random), n.primary)] }));

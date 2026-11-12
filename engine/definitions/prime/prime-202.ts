import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { randomEnemies } from '../../effects/selectors';

// PRIME_202 Divine Force: "Deal 2 damage to two Random enemies; Overcharge (2)" (distinct, hero included)
export default defineCard('PRIME_202', (n) => ({ onPlay: [damage(randomEnemies(n.random), n.primary)] }));

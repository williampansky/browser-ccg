import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { enemyHero } from '../../effects/selectors';

// PRIME_004 Soul Miner, Demise: "Deal 2 damage to the enemy player"
export default defineCard('PRIME_004', (n) => ({ onDeath: [damage(enemyHero(), n.primary)] }));

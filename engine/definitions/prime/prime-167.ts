import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { randomEnemies } from '../../effects/selectors';

// PRIME_167 Sorcerer's Dance: "Deal 8 damage to 8 Random enemies" (distinct; the hero counts as an enemy)
export default defineCard('PRIME_167', (n) => ({ onPlay: [damage(randomEnemies(n.random), n.primary)] }));

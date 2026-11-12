import { defineCard } from '../define-card';
import { scatterDamage } from '../../effects/primitives';

// PRIME_014 Archery Yard: "Can't Attack. Deal 4 damage, split across all players" (4 separate points, each to a random character on either side)
export default defineCard('PRIME_014', () => ({ onPlay: [scatterDamage(4)] }));

import { defineCard } from '../define-card';
import { tradeWeakestForStrongest } from '../../effects/primitives';

// PRIME_246 The Chaos Knight, On Death: "Swap your weakest minion for the enemy's strongest" (weakest = least Attack + Health)
export default defineCard('PRIME_246', () => ({ onDeath: [tradeWeakestForStrongest()] }));

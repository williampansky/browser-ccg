import { defineCard } from '../define-card';
import { destroyRandomNumberOfAll } from '../../effects/primitives';

// PRIME_242 Snap: "Destroy a Random number of ALL minions" (0 to all of them, either side, picked at random)
export default defineCard('PRIME_242', () => ({ onPlay: [destroyRandomNumberOfAll()] }));

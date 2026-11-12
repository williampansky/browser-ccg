import { defineCard } from '../define-card';
import { freeMysteryThisTurn } from '../../effects/primitives';

// PRIME_147 Vibrant Mage: "The next Mystery you play this turn costs 0"
export default defineCard('PRIME_147', () => ({ onPlay: [freeMysteryThisTurn()] }));

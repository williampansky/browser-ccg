import { defineCard } from '../define-card';
import { draw } from '../../effects/primitives';

// PRIME_013 Ploofer, Demise: "Draw a card"
export default defineCard('PRIME_013', () => ({ onDeath: [draw(1)] }));

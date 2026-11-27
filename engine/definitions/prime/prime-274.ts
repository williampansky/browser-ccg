import { defineCard } from '../define-card';
import { draw } from '../../effects/primitives';

// PRIME_274 Arcane Study: "Draw the next 2 cards from your deck"
export default defineCard('PRIME_274', (n) => ({ onPlay: [draw(n.primary)] }));

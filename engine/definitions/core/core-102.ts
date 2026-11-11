import { defineCard } from '../define-card';
import { draw } from '../../effects/primitives';

// CORE_102: "Draw the next 4 cards from your deck"
export default defineCard('CORE_102', (n) => ({ onPlay: [draw(n.primary)] }));

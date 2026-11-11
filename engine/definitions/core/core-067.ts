import { defineCard } from '../define-card';
import { draw } from '../../effects/primitives';

// CORE_067 item: "Draw 2 cards"
export default defineCard('CORE_067', (n) => ({
  onPlay: [draw(n.primary)],
}));

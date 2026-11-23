import { defineCard } from '../define-card';
import { draw } from '../../effects/primitives';

// CORE_026 On Play effect: "Draw a card"
export default defineCard('CORE_026', () => ({
  onPlay: [draw(1)],
}));

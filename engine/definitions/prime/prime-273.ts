import { defineCard } from '../define-card';
import { draw } from '../../effects/primitives';

// PRIME_273 Apprentice Scribe, On Play effect: "Draw a card"
export default defineCard('PRIME_273', () => ({ onPlay: [draw(1)] }));

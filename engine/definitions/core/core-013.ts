import { defineCard } from '../define-card';
import { draw } from '../../effects/primitives';

// CORE_013 Skullkid Shaman, warcry: "Draw a card"
export default defineCard('CORE_013', () => ({ onPlay: [draw(1)] }));

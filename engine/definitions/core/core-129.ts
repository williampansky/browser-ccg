import { defineCard } from '../define-card';
import { addArmor, draw } from '../../effects/primitives';

// CORE_129 (item): "Gain +5 armor and draw a card"
export default defineCard('CORE_129', (n) => ({ onPlay: [addArmor(n.primary), draw(1)] }));

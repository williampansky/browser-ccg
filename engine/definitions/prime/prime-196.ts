import { defineCard } from '../define-card';
import { draw, setSpellDiscount } from '../../effects/primitives';

// PRIME_196 Soul Lantern (item, 1): "The next spell you play this turn costs 2 less; draw a card"
export default defineCard('PRIME_196', (n) => ({ onPlay: [setSpellDiscount(n.primary), draw(1)] }));

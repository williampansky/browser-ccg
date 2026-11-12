import { defineCard } from '../define-card';
import { draw, silence } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

// PRIME_178 Diminish All: "Suppress all minions; then draw a card"
export default defineCard('PRIME_178', () => ({ onPlay: [silence(allMinions()), draw(1)] }));

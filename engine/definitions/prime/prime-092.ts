import { defineCard } from '../define-card';
import { addCardToHand } from '../../effects/primitives';

// PRIME_092 Predator, warcry: "Give your opponent 2 Sushi cards" (+1/+1 items, PRIME_092a)
export default defineCard('PRIME_092', () => ({ onPlay: [addCardToHand('PRIME_092a', 0, true), addCardToHand('PRIME_092a', 0, true)] }));

import { defineCard } from '../define-card';
import { addRandomCardToHand } from '../../effects/primitives';

// PRIME_091 Harry, warcry: "Add a Random Mythic minion to your hand"
export default defineCard('PRIME_091', () => ({ onPlay: [addRandomCardToHand((c) => c.type === 'minion' && c.rarity === 'MYTHIC')] }));

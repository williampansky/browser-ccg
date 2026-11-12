import { defineCard } from '../define-card';
import { addRandomCardToHand } from '../../effects/primitives';

// PRIME_216 The Ritual: "Add a Random Undead minion to your hand" (the data's Demonic race; the cards call it Undead)
export default defineCard('PRIME_216', () => ({ onPlay: [addRandomCardToHand((c) => c.type === 'minion' && c.race === 'DEMONIC')] }));

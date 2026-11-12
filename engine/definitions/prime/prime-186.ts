import { defineCard } from '../define-card';
import { addRandomCardToHand } from '../../effects/primitives';

// PRIME_186 Gift Box (item): "Add 2 Random cards to your hand" (any playable CORE or PRIME cards)
export default defineCard('PRIME_186', (n) => ({ onPlay: [addRandomCardToHand(() => true, n.random)] }));

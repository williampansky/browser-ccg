import { defineCard } from '../define-card';
import { addCardToHand } from '../../effects/primitives';

// PRIME_051 Desert Lizard: "Demise: Add a Chopped Desert Lizard to your hand" (PRIME_051a, a +1/+1 for one turn item)
export default defineCard('PRIME_051', () => ({ onDeath: [addCardToHand('PRIME_051a')] }));

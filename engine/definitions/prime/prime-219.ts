import { defineCard } from '../define-card';
import { drawMinionsFromDeck } from '../../effects/primitives';

// PRIME_219 Summon Old Friends: "Draw two minion cards from your deck" (the first two in deck order; fewer if the deck has fewer)
export default defineCard('PRIME_219', (n) => ({ onPlay: [drawMinionsFromDeck(n.primary)] }));

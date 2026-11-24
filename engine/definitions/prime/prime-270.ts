import { defineCard } from '../define-card';
import { discardRandom } from '../../effects/primitives';

// PRIME_270 On Play: "Discard 2 random cards from your hand" (Rush comes from
// the card's keywords)
export default defineCard('PRIME_270', (n) => ({
  onPlay: [discardRandom(n.primary)],
}));

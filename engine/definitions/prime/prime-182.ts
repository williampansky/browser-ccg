import { defineCard } from '../define-card';
import { summonCopyFromEnemyDeck } from '../../effects/primitives';

// PRIME_182 spell: "Put a copy of a random minion from your opponent's deck
// into the battlefield" (their deck keeps the card)
export default defineCard('PRIME_182', () => ({
  onPlay: [summonCopyFromEnemyDeck],
}));

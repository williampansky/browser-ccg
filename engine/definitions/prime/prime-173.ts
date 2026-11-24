import { defineCard } from '../define-card';
import { copyFromEnemyDeck } from '../../effects/primitives';

const COPIES = 2;

// PRIME_173 spell: "Copy 2 cards from your opponent's deck and put them into
// your hand" (random ones; their deck keeps the cards)
export default defineCard('PRIME_173', () => ({
  onPlay: [copyFromEnemyDeck(COPIES)],
}));

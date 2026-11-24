import { defineCard } from '../define-card';
import { drawToMatchOpponent } from '../../effects/primitives';

// PRIME_264 spell: "Draw cards until you have as many as your opponent (up to
// 5)"
export default defineCard('PRIME_264', (n) => ({
  onPlay: [drawToMatchOpponent(n.primary)],
}));

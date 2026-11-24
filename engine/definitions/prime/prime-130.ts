import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { randomEnemyMinions } from '../../effects/selectors';

const MIN_MINIONS = 2;

// PRIME_130 spell: "Destroy a random enemy minion; can only be played with 2+
// minions on board". Read as: 2 or more minions on YOUR side (RULES Appendix B).
export default defineCard('PRIME_130', () => ({
  canPlay: ({ state, player }) =>
    state.players[player].board.length >= MIN_MINIONS,
  onPlay: [destroy(randomEnemyMinions(1))],
}));

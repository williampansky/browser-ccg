import { defineCard } from '../define-card';

// PRIME_085 Bark Creature: "Costs 1 less to play for each other active minion" (minions on BOTH sides count)
export default defineCard('PRIME_085', () => ({
  ownCost: ({ state }) => -(state.players['0'].board.length + state.players['1'].board.length),
}));

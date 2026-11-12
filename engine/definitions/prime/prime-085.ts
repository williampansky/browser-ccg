import { defineCard } from '../define-card';

// PRIME_085 Bark Creature: "Costs 1 less for each minion that has died this game (max 6)" (either side, counted from the start)
export default defineCard('PRIME_085', () => ({ ownCost: ({ state }) => -Math.min(6, state.deaths ?? 0) }));

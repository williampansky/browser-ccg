import { defineCard } from '../define-card';

// PRIME_029: "Costs 1 less per Attack of your weapon" (+ Guard from the data). Your weapon only, its current Attack (including a this-turn boost); never below 0.
export default defineCard('PRIME_029', () => ({ ownCost: ({ state, owner }) => -(state.players[owner].weapon?.attack ?? 0) }));

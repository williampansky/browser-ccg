import { defineCard } from '../define-card';

// PRIME_086 Spider Mech: "Costs 1 less to play for each other card you're holding"
export default defineCard('PRIME_086', () => ({
  ownCost: ({ state, owner }) => -(state.players[owner].hand.length - 1),
}));

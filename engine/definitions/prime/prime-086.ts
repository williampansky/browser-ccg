import { defineCard } from '../define-card';

// PRIME_086 Spider Mech: "Costs 1 less for each card you played this turn and last (max 6)" (your previous turn, not the opponent's)
export default defineCard('PRIME_086', () => ({
  ownCost: ({ state, owner }) => -Math.min(6, (state.players[owner].plays?.now ?? 0) + (state.players[owner].plays?.prev ?? 0)),
}));

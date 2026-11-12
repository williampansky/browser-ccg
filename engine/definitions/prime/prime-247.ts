import { defineCard } from '../define-card';

// PRIME_247 Volcanic Giant (12): "Costs 1 less for each point of Armor you have lost" (Armor soaked up by damage, over the whole game)
export default defineCard('PRIME_247', () => ({ ownCost: ({ state, owner }) => -(state.players[owner].armorSpent ?? 0) }));

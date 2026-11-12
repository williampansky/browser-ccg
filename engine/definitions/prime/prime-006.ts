import { defineCard } from '../define-card';

// PRIME_006 Swiftpack: "Gain Stampede if you have a weapon equipped"
export default defineCard('PRIME_006', () => ({
  conditionalKeywords: ['rush'],
  selfAura: ({ state, owner }) => ({ rush: state.players[owner].weapon !== null }),
}));

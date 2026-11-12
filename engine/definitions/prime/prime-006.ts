import { defineCard } from '../define-card';

// PRIME_006 Swiftpack: "While you have a weapon: +1 Attack and Rush"
export default defineCard('PRIME_006', () => ({
  conditionalKeywords: ['rush'],
  selfAura: ({ state, owner }) => {
    const armed = state.players[owner].weapon !== null;
    return { attack: armed ? 1 : 0, rush: armed };
  },
}));

import { defineCard } from '../define-card';

// PRIME_022 Blood-crazed Assassin: "Onslaught on turns your hero took damage" (not printed: the data lists it, the card only has it then)
export default defineCard('PRIME_022', () => ({
  conditionalKeywords: ['doubleAttack'],
  selfAura: ({ state, owner }) => ({ doubleAttack: state.players[owner].heroHurtOnTurn === state.turn }),
}));

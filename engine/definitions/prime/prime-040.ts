import { defineCard } from '../define-card';

// PRIME_040 Slick Naga (4/4): "Onslaught. Loses it when damaged" (the data lists Onslaught; it only has it while unhurt)
export default defineCard('PRIME_040', () => ({
  conditionalKeywords: ['doubleAttack'],
  selfAura: ({ minion }) => ({ doubleAttack: minion.health >= minion.maxHealth }),
}));

import { defineCard } from '../define-card';

// PRIME_244 The DragonMancer: "Rush. Onslaught while damaged"
export default defineCard('PRIME_244', () => ({
  selfAura: ({ minion }) => ({ doubleAttack: minion.health < minion.maxHealth }),
}));

import { defineCard } from '../define-card';

// PRIME_244 The DragonMancer: "Stampede. +6 AP if damaged"
export default defineCard('PRIME_244', (n) => ({
  selfAura: ({ minion }) => ({ attack: minion.health < minion.maxHealth ? n.primary : 0 }),
}));

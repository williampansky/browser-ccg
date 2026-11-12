import { defineCard } from '../define-card';

// PRIME_024 Deep Diver: "Guard. +3 Attack if damaged"
export default defineCard('PRIME_024', (n) => ({
  selfAura: ({ minion }) => ({ attack: minion.health < minion.maxHealth ? n.primary : 0 }),
}));

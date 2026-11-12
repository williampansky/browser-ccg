import { defineCard } from '../define-card';

// PRIME_041 Crazy Imp: "+5 Attack if damaged"
export default defineCard('PRIME_041', (n) => ({
  selfAura: ({ minion }) => ({ attack: minion.health < minion.maxHealth ? n.primary : 0 }),
}));

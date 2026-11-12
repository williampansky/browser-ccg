import { defineCard } from '../define-card';

// PRIME_009 Enraged Slug: "+3 Attack if damaged"
export default defineCard('PRIME_009', (n) => ({
  selfAura: ({ minion }) => ({ attack: minion.health < minion.maxHealth ? n.primary : 0 }),
}));

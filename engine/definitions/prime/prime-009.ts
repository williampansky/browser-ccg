import { defineCard } from '../define-card';

// PRIME_009 Enraged Slug: "+2 Attack and Rush if damaged"
export default defineCard('PRIME_009', (n) => ({
  selfAura: ({ minion }) => {
    const hurt = minion.health < minion.maxHealth;
    return { attack: hurt ? n.primary : 0, rush: hurt };
  },
}));

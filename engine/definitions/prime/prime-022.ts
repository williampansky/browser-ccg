import { defineCard } from '../define-card';

// PRIME_022 Blood-crazed Assassin: "If damaged; gain +1 AP and Onslaught"
export default defineCard('PRIME_022', (n) => ({
  conditionalKeywords: ['doubleAttack'],
  selfAura: ({ minion }) => {
    const hurt = minion.health < minion.maxHealth;
    return { attack: hurt ? n.primary : 0, doubleAttack: hurt };
  },
}));

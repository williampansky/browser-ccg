import { defineCard } from '../define-card';

// PRIME_220 Ancient Portal: "Your minions that cost 4 or more cost 2 less (never below 3)"
export default defineCard('PRIME_220', (n) => ({
  costMods: [{ affects: (card) => card.type === 'minion' && card.cost >= 4, delta: -n.primary, floor: 3 }],
}));

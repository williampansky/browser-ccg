import { defineCard } from '../define-card';

// PRIME_220 Ancient Portal: "Your minions cost 2 less, but not less than 1"
export default defineCard('PRIME_220', (n) => ({
  costMods: [{ affects: (card) => card.type === 'minion', delta: -n.primary, floor: 1 }],
}));

import { defineCard } from '../define-card';

// PRIME_142 Demon Sorcerer: "Your spell cards cost 1 less to play" (spells only, not items)
export default defineCard('PRIME_142', () => ({
  costMods: [{ affects: (card) => card.type === 'spell', delta: -1 }],
}));

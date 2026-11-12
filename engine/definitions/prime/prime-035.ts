import { defineCard } from '../define-card';

// PRIME_035 Mad Slayer: "+2 Attack while damaged"
export default defineCard('PRIME_035', (n) => ({
  selfAura: ({ minion }) => ({ attack: minion.health < minion.maxHealth ? n.primary : 0 }),
}));

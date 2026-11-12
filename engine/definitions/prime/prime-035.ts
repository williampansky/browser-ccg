import { defineCard } from '../define-card';

// PRIME_035 Mad Slayer: "+1 Attack for each damage taken (max +4)"
export default defineCard('PRIME_035', () => ({
  selfAura: ({ minion }) => ({ attack: Math.min(4, Math.max(0, minion.maxHealth - minion.health)) }),
}));

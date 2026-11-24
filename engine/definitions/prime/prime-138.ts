import { defineCard } from '../define-card';

// PRIME_138 weapon: "Your hero is Immune while attacking" (no counter-damage
// from the minion it hits with this weapon)
export default defineCard('PRIME_138', () => ({
  heroImmuneWhileAttacking: true,
}));

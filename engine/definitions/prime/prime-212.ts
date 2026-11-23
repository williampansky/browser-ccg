import { defineCard } from '../define-card';

// PRIME_212 weapon: "Onslaught. Overload (2)": the hero may swing it twice a
// turn (the overload comes from the data)
export default defineCard('PRIME_212', () => ({
  weaponDoubleAttack: true,
}));

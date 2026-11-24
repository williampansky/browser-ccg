import { defineCard } from '../define-card';

// PRIME_177: "Your cards and powers that restore Health now deal damage
// instead." While it is on your board (and not silenced), `heal` deals the
// amount as damage to whatever it was aimed at.
export default defineCard('PRIME_177', () => ({ healsAsDamage: true }));

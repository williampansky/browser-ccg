import { defineCard } from '../define-card';

// PRIME_174 Forest Elemental: "This minion's Attack is always equal to its Health" (its base Attack is replaced by its Health)
export default defineCard('PRIME_174', () => ({
  selfAura: ({ minion, base }) => ({ attack: minion.health - base }),
}));

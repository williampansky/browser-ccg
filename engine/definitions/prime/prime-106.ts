import { defineCard } from '../define-card';

const SPELL_DAMAGE_BONUS = 5;

// PRIME_106: "+5 Spell Damage" (the data has no number for it)
export default defineCard('PRIME_106', () => ({
  spellDamage: SPELL_DAMAGE_BONUS,
}));

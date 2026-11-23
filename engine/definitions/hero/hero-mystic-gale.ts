import { defineCard } from '../define-card';

const GALE_SPELL_DAMAGE = 1;

// HERO_MYSTIC_GALE (Gale Totem, a token of the Mystic's skill): Spell Damage
export default defineCard('HERO_MYSTIC_GALE', () => ({
  spellDamage: GALE_SPELL_DAMAGE,
}));

import { defineCard } from '../define-card';

// GAME_007 Gale Totem (a token of the Mystic's skill): "+%NUM1% Spell Damage"
export default defineCard('GAME_007', (n) => ({
  spellDamage: n.primary,
}));

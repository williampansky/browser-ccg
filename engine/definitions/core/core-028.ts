import { defineCard } from '../define-card';

// CORE_028 "+1 Spell Damage": raises the damage of your spells while on the board (not On Play effects, heals or draws)
export default defineCard('CORE_028', (n) => ({
  spellDamage: n.primary,
}));

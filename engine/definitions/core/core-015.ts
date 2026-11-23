import { defineCard } from '../define-card';

// CORE_015 "+1 Spell Damage": raises the damage of your spells while on the
// board (not On Play effects, heals or draws)
export default defineCard('CORE_015', (n) => ({
  spellDamage: n.primary,
}));

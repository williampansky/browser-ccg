import { defineCard } from '../define-card';

// CORE_037 "+1 Spell Damage": raises the damage of your spells while on the board (not warcries, heals or draws)
export default defineCard('CORE_037', (n) => ({
  spellDamage: n.primary,
}));

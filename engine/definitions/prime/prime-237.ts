import { defineCard, on } from '../define-card';
import { addArmor } from '../../effects/primitives';

// PRIME_237 Spellsmith: "Gain 1 Armor whenever a friendly minion takes damage"
export default defineCard('PRIME_237', (n) => ({
  triggers: [on('MinionDamaged', { when: (e, c) => e.player === c.owner, do: [addArmor(n.primary)] })],
}));

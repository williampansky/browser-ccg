import { defineCard, on } from '../define-card';
import { addArmor } from '../../effects/primitives';

// PRIME_237 Spellsmith: "Gain 2 Armor whenever a friendly minion dies"
export default defineCard('PRIME_237', (n) => ({
  triggers: [on('MinionDied', { when: (e, c) => e.player === c.owner, do: [addArmor(n.primary)] })],
}));

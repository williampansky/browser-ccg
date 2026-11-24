import { defineCard, on } from '../define-card';
import { addArmor } from '../../effects/primitives';

// PRIME_261: "Whenever a friendly minion takes damage, gain 1 Armor"
export default defineCard('PRIME_261', (n) => ({
  triggers: [
    on('MinionDamaged', {
      when: (event, info) => event.player === info.owner,
      do: [addArmor(n.primary)],
    }),
  ],
}));

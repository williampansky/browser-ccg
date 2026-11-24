import { defineCard, on } from '../define-card';
import { addWeaponDurability } from '../../effects/primitives';

const DURABILITY_GAIN = 1;

// PRIME_134 weapon: "Whenever a friendly Mystery is revealed, gain +1
// Durability"
export default defineCard('PRIME_134', () => ({
  triggers: [
    on('MysteryRevealed', {
      when: (event, info) => event.player === info.owner,
      do: [addWeaponDurability(DURABILITY_GAIN)],
    }),
  ],
}));

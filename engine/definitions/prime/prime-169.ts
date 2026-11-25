import { defineCard } from '../define-card';
import { addArmor, equipTokenWeapon } from '../../effects/primitives';

// PRIME_169: "Bubble, Bulwark. On Death: Gain 5 Armor and equip The Broken
// Pendulum" (the 3/2 weapon token PRIME_169a)
export default defineCard('PRIME_169', () => ({
  onDeath: [addArmor(5), equipTokenWeapon()],
}));

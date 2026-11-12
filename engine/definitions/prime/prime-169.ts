import { defineCard } from '../define-card';
import { addArmor, equipTokenWeapon } from '../../effects/primitives';

// PRIME_169 Paladin of the Shattered Mirror: "Bubble, Guard. Demise: Gain 5 Armor and equip a 3/2 Mace" (PRIME_169a)
export default defineCard('PRIME_169', () => ({ onDeath: [addArmor(5), equipTokenWeapon()] }));

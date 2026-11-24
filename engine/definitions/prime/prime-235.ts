import { defineCard } from '../define-card';
import { equipTokenWeapon } from '../../effects/primitives';

const TRAINING_SWORD = 'PRIME_235a';

// PRIME_235 On Play: "Equip a 2/2 weapon" (the token is PRIME_235a)
export default defineCard('PRIME_235', () => ({
  onPlay: [equipTokenWeapon(TRAINING_SWORD)],
}));

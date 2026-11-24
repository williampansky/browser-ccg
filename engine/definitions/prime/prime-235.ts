import { defineCard } from '../define-card';
import { equipTokenWeapon } from '../../effects/primitives';

const TRAINING_SWORD = 'GAME_013';

// PRIME_235 On Play: "Equip a 2/2 weapon" (the token is GAME_013)
export default defineCard('PRIME_235', () => ({
  onPlay: [equipTokenWeapon(TRAINING_SWORD)],
}));

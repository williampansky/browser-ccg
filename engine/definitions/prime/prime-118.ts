import { defineCard } from '../define-card';
import { addArmor, heroAttackThisTurn } from '../../effects/primitives';

const ATTACK_BONUS = 4;
const ARMOR_GAIN = 4;

// PRIME_118: "Give your hero +4 Attack this turn. Gain 4 Armor."
export default defineCard('PRIME_118', () => ({
  onPlay: [heroAttackThisTurn(ATTACK_BONUS), addArmor(ARMOR_GAIN)],
}));

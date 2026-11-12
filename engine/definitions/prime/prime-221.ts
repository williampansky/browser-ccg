import { defineCard } from '../define-card';
import { loseEnergySlot } from '../../effects/primitives';

// PRIME_221 Mechanized Peace Keeper: "Guard. Destroy one of your Action Point Slots" (your total energy -1, now and for the rest of the game)
export default defineCard('PRIME_221', () => ({ onPlay: [loseEnergySlot(1)] }));

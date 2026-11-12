import { defineCard } from '../define-card';
import { draw, gainEnergySlot } from '../../effects/primitives';

// PRIME_121 Sanctity: "Select One: Gain 2 Action Point Slots; or draw 3 cards"
export default defineCard('PRIME_121', () => ({
  choices: [
    { label: 'Gain 2 energy slots', onPlay: [gainEnergySlot(2)] },
    { label: 'Draw 3 cards', onPlay: [draw(3)] },
  ],
}));

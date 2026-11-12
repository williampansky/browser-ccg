import { defineCard } from '../define-card';
import { draw, drawDiscounted, gainEnergySlot } from '../../effects/primitives';

// PRIME_121 Sanctity, Select One: "+1 energy slot and draw a card; or draw 2 cards that cost 1 less"
export default defineCard('PRIME_121', () => ({
  choices: [
    { label: '+1 energy slot and draw a card', onPlay: [gainEnergySlot(1), draw(1)] },
    { label: 'Draw 2 cards that cost 1 less', onPlay: [drawDiscounted(2, -1)] },
  ],
}));

import { defineCard } from '../define-card';
import { addArmor, damage, draw } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_112 Night Breeze, Select One: "2 damage and gain 2 Armor; or 1 damage and draw a card"
export default defineCard('PRIME_112', (n) => ({
  choices: [
    { label: `Deal ${n.primary} damage and gain 2 Armor`, target: anyCharacter(), onPlay: [damage(chosenTarget(), n.primary), addArmor(2)] },
    { label: 'Deal 1 damage and draw a card', target: anyCharacter(), onPlay: [damage(chosenTarget(), 1), draw(1)] },
  ],
}));

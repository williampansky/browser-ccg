import { defineCard } from '../define-card';
import { damage, draw } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_112 Night Breeze: "Select One: Deal 3 damage; or 1 and draw a card"
export default defineCard('PRIME_112', (n) => ({
  choices: [
    { label: `Deal ${n.primary} damage`, target: anyCharacter(), onPlay: [damage(chosenTarget(), n.primary)] },
    { label: 'Deal 1 damage and draw a card', target: anyCharacter(), onPlay: [damage(chosenTarget(), 1), draw(1)] },
  ],
}));

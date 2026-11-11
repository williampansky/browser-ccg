import { defineCard } from '../define-card';
import { damage, draw } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_080 spell: "Deal 3 damage, and draw a card"
export default defineCard('CORE_080', (n) => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary), draw(1)],
}));

import { defineCard } from '../define-card';
import { damage, draw } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_097 spell: "Deal 1 damage and draw a card"
export default defineCard('CORE_097', (n) => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary), draw(1)],
}));

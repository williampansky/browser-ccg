import { defineCard } from '../define-card';
import { damage, discardRandom } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_116 spell: "Deal 4 damage; discard a Random card"
export default defineCard('CORE_116', (n) => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary), discardRandom(n.random)],
}));

import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_120 spell: "Deal N damage"
export default defineCard('CORE_120', (n) => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary)],
}));

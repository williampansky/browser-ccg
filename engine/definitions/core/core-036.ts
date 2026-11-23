import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_036 On Play effect: "Deal 2 damage"
export default defineCard('CORE_036', (n) => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary)],
}));

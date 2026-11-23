import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_112 On Play effect: "Deal 3 damage"
export default defineCard('CORE_112', (n) => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary)],
}));

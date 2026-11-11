import { defineCard } from '../define-card';
import { damage, disable } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_105 spell: "Deal 1 damage and Disable a target"
export default defineCard('CORE_105', (n) => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary), disable(chosenTarget())],
}));

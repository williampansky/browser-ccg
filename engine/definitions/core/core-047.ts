import { defineCard } from '../define-card';
import { heal } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_047 item: "Heal 8 Health"
export default defineCard('CORE_047', (n) => ({
  target: anyCharacter(),
  onPlay: [heal(chosenTarget(), n.primary)],
}));

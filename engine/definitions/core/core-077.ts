import { defineCard } from '../define-card';
import { heal } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_077 item: "Heal 6 Health"
export default defineCard('CORE_077', (n) => ({
  target: anyCharacter(),
  onPlay: [heal(chosenTarget(), n.primary)],
}));

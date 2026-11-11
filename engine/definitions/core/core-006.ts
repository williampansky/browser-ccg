import { defineCard } from '../define-card';
import { heal } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyCharacter } from '../../effects/filters';

// CORE_006 warcry: "Heal a friendly target for 2 HP" (amount is numberSecondary)
export default defineCard('CORE_006', (n) => ({
  target: friendlyCharacter(),
  onPlay: [heal(chosenTarget(), n.secondary)],
}));

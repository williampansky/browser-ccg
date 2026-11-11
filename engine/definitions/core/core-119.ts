import { defineCard } from '../define-card';
import { damageWithLifesteal } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_119 spell: "Deal 2 damage; heal for that amount"
export default defineCard('CORE_119', (n) => ({
  target: anyCharacter(),
  onPlay: [damageWithLifesteal(chosenTarget(), n.primary)],
}));

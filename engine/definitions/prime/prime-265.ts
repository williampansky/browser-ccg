import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_265 spell: "Deal 2 damage to a character. Combo: Deal 4 instead"
export default defineCard('PRIME_265', (n) => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary)],
  combo: { effects: [damage(chosenTarget(), n.secondary)], instead: true },
}));

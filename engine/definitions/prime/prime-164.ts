import { defineCard } from '../define-card';
import { drawThenDamageByCost } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_164 spell: "Draw a card and deal damage equal to its cost" to a
// character you choose (read as aimed, RULES)
export default defineCard('PRIME_164', () => ({
  target: anyCharacter(),
  onPlay: [drawThenDamageByCost(chosenTarget())],
}));

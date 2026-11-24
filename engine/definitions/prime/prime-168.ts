import { defineCard } from '../define-card';
import { draw, heal } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

const CARDS_DRAWN = 3;

// PRIME_168 spell: "Heal 8 Health; draw 3 cards" (the healing goes to a
// character you choose)
export default defineCard('PRIME_168', (n) => ({
  target: anyCharacter(),
  onPlay: [heal(chosenTarget(), n.primary), draw(CARDS_DRAWN)],
}));

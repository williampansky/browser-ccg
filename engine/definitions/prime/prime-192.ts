import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

const DAMAGE = 1;
const COMBO_DAMAGE = 2;

// PRIME_192 (weapon): "On Play: Deal 1 damage. Combo: Deal 2 instead." to a
// character you choose.
export default defineCard('PRIME_192', () => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), DAMAGE)],
  combo: { effects: [damage(chosenTarget(), COMBO_DAMAGE)], instead: true },
}));

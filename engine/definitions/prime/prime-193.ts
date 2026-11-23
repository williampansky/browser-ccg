import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

const COMBO_DAMAGE = 2;

// PRIME_193, Combo: "Deal 2 damage" to a character you choose. It only asks
// for a target when you have already played a card this turn.
export default defineCard('PRIME_193', () => ({
  combo: {
    target: anyCharacter(),
    effects: [damage(chosenTarget(), COMBO_DAMAGE)],
  },
}));

import { defineCard } from '../define-card';
import { damage, disable } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyCharacter } from '../../effects/filters';

// PRIME_259 spell: "Deal 1 damage to an enemy and Disable it" (a minion, or the
// hero, which then cannot swing next turn)
export default defineCard('PRIME_259', (n) => ({
  target: enemyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary), disable(chosenTarget())],
}));

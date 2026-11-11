import { defineCard } from '../define-card';
import { damage, disable } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyCharacter } from '../../effects/filters';

// CORE_066 spell: "Deal 3 damage to an enemy and Disable it"
export default defineCard('CORE_066', (n) => ({
  target: enemyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary), disable(chosenTarget())],
}));

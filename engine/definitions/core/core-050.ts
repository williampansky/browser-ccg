import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget, otherEnemies } from '../../effects/selectors';
import { enemyCharacter } from '../../effects/filters';

// CORE_050 spell: "Deal 4 damage to an enemy and 1 damage to all others" (all other enemies, as in hsclone)
export default defineCard('CORE_050', (n) => ({
  target: enemyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary), damage(otherEnemies(), n.secondary)],
}));

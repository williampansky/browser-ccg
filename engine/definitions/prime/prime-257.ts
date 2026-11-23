import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { allEnemies } from '../../effects/selectors';

// PRIME_257 spell: "Deal 4 damage to all enemies. Overload (2)" (the hero and
// every minion; the overload comes from the data)
export default defineCard('PRIME_257', (n) => ({
  onPlay: [damage(allEnemies(), n.primary)],
}));

import { defineCard } from '../define-card';
import { reduceAttackUntilNextTurn } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyMinion } from '../../effects/filters';

// PRIME_262 On Play: "Give an enemy minion -2 Attack until your next turn"
export default defineCard('PRIME_262', (n) => ({
  target: enemyMinion(),
  onPlay: [reduceAttackUntilNextTurn(chosenTarget(), n.primary)],
}));

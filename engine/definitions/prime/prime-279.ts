import { defineCard } from '../define-card';
import { transformInto } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyMinion } from '../../effects/filters';

// PRIME_279 spell: "Transform an enemy minion into a 1/1 Creature"
export default defineCard('PRIME_279', () => ({
  target: enemyMinion(),
  onPlay: [transformInto(chosenTarget())],
}));

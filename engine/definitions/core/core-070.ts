import { defineCard } from '../define-card';
import { transformInto } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyMinion } from '../../effects/filters';

// CORE_070 spell: "Transform an enemy minion into a 1/1 Creature"
export default defineCard('CORE_070', () => ({
  target: enemyMinion(),
  onPlay: [transformInto(chosenTarget())],
}));

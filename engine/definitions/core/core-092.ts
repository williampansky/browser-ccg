import { defineCard } from '../define-card';
import { steal } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyMinion } from '../../effects/filters';

// CORE_092 spell: "Steal an enemy minion"
export default defineCard('CORE_092', () => ({
  target: enemyMinion(),
  onPlay: [steal(chosenTarget())],
}));

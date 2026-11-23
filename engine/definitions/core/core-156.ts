import { defineCard } from '../define-card';
import { summonCopyOf } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyMinion } from '../../effects/filters';

// CORE_156 spell: "Summon a copy of a chosen enemy minion" (a copy for you: its
// current stats and keywords, at the right end of your board)
export default defineCard('CORE_156', () => ({
  target: enemyMinion(),
  onPlay: [summonCopyOf(chosenTarget())],
}));

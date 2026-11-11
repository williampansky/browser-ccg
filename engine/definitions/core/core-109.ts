import { defineCard } from '../define-card';
import { transformInto } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_109 spell: "Transform a minion into a 0/1 Undead with Guard"
export default defineCard('CORE_109', () => ({
  target: anyMinion(),
  onPlay: [transformInto(chosenTarget())],
}));

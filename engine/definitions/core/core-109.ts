import { defineCard } from '../define-card';
import { transformInto } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_109 spell: "Transform a minion into a 1/1" (its entourage card
// CORE_109a; the Mystic's 0/1 Guard version is PRIME_260)
export default defineCard('CORE_109', () => ({
  target: anyMinion(),
  onPlay: [transformInto(chosenTarget())],
}));

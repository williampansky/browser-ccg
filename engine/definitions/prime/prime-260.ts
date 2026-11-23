import { defineCard } from '../define-card';
import { transformInto } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_260 spell (the Mystic's copy of the old CORE_109): "Transform a minion
// into a 0/1 with Guard" (its entourage card PRIME_260a)
export default defineCard('PRIME_260', () => ({
  target: anyMinion(),
  onPlay: [transformInto(chosenTarget())],
}));

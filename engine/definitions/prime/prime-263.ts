import { defineCard } from '../define-card';
import { destroy, healByTargetHealth } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_263 On Play: "Destroy a minion and heal your hero for its Health" (the
// Health it has when it is destroyed, so a damaged minion heals less)
export default defineCard('PRIME_263', () => ({
  target: anyMinion(),
  onPlay: [healByTargetHealth, destroy(chosenTarget())],
}));

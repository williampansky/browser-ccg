import { defineCard } from '../define-card';
import { damage, silence } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_201 Storm Crackle!: "Suppress a minion, then deal 1 damage to it" (silenced first, so a demise does not fire)
export default defineCard('PRIME_201', () => ({
  target: anyMinion(),
  onPlay: [silence(chosenTarget()), damage(chosenTarget(), 1)],
}));

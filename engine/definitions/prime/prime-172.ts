import { defineCard } from '../define-card';
import { setAttackToHealth } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_172 Equilibrium: "Set a minion's Attack to equal its Health"
export default defineCard('PRIME_172', () => ({ target: anyMinion(), onPlay: [setAttackToHealth(chosenTarget())] }));

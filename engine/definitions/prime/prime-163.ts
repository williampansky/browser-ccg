import { defineCard } from '../define-card';
import { doubleAttackStat } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_163 Enhancement: "Double a minion's Attack's power"
export default defineCard('PRIME_163', () => ({ target: anyMinion(), onPlay: [doubleAttackStat(chosenTarget())] }));

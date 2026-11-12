import { defineCard } from '../define-card';
import { swapAttackAndHealth } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_048 Invoked Shaman, warcry: "Swap the values of a minion's Attack and Health"
export default defineCard('PRIME_048', () => ({ target: anyMinion(), onPlay: [swapAttackAndHealth(chosenTarget())] }));

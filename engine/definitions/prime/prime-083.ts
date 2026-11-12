import { defineCard } from '../define-card';
import { becomeCopyOf } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_083 Void Egg, warcry: "Choose a minion; become a copy of it" (its card, stats, keywords and effects; this warcry does not run again)
export default defineCard('PRIME_083', () => ({ target: anyMinion(), onPlay: [becomeCopyOf(chosenTarget())] }));

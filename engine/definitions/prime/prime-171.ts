import { defineCard } from '../define-card';
import { silence } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_171 Coruscation: "Suppress a minion"
export default defineCard('PRIME_171', () => ({ target: anyMinion(), onPlay: [silence(chosenTarget())] }));

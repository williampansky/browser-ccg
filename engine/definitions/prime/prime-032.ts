import { defineCard } from '../define-card';
import { silence } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_032 Siren, warcry: "Suppress a minion" (either side)
export default defineCard('PRIME_032', () => ({ target: anyMinion(), onPlay: [silence(chosenTarget())] }));

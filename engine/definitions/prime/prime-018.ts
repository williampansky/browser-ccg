import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_018 Mad Demon: "Gain +1 Attack every time a minion dies" (any minion, either side)
export default defineCard('PRIME_018', (n) => ({ triggers: [on('MinionDied', { do: [buff(self(), n.primary, 0)] })] }));

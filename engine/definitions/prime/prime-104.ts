import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_104 Perses: "Buffs himself with +1/+1 at the end of each turn" (EACH turn: yours and the opponent's)
export default defineCard('PRIME_104', (n) => ({
  triggers: [on('TurnEnded', { do: [buff(self(), n.primary, n.primary)] })],
}));

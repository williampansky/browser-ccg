import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_136 Primal Hunter, On Death: "Summon a minion" (1 Primal Beast,
// PRIME_136a)
export default defineCard('PRIME_136', () => ({
  onDeath: [summonEntourage()],
}));

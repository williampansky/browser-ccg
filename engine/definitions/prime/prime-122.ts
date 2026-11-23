import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_122: "Summon three 2/2 minions with Rush" (the token is PRIME_122a)
export default defineCard('PRIME_122', () => ({
  onPlay: [summonEntourage(), summonEntourage(), summonEntourage()],
}));

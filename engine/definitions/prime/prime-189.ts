import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_189, Combo: "Summon a 2/1 Defias Bandit" (the token is PRIME_189a)
export default defineCard('PRIME_189', () => ({
  combo: { effects: [summonEntourage()] },
}));

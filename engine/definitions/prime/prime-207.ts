import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_207 spell: "Summon two 2/3 minions with Guard. Overload (2)" (the
// minion is its entourage card PRIME_207a; the overload comes from the data)
export default defineCard('PRIME_207', () => ({
  onPlay: [summonEntourage(), summonEntourage()],
}));

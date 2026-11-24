import { defineCard } from '../define-card';
import { summonUntilFull } from '../../effects/primitives';

const WHELP = 'PRIME_108a';

// PRIME_108 On Play: "Summon 1/1 Whelps until your side of the battlefield is
// full" (the token is PRIME_108a)
export default defineCard('PRIME_108', () => ({
  onPlay: [summonUntilFull(WHELP)],
}));

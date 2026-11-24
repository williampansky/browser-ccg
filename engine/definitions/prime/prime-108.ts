import { defineCard } from '../define-card';
import { summonUntilFull } from '../../effects/primitives';

const WHELP = 'GAME_012';

// PRIME_108 On Play: "Summon 1/1 Whelps until your side of the battlefield is
// full" (the token is GAME_012)
export default defineCard('PRIME_108', () => ({
  onPlay: [summonUntilFull(WHELP)],
}));

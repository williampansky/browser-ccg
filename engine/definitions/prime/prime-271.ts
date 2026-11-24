import { defineCard } from '../define-card';
import { setHeroHealth, summonEntourage } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// PRIME_271 On Play: "Set your Health to 15 and summon a 6/6 Infernal" (the
// token is GAME_009)
export default defineCard('PRIME_271', (n) => ({
  onPlay: [setHeroHealth(ownHero(), n.primary), summonEntourage()],
}));

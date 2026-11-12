import { defineCard } from '../define-card';
import { setHeroHealth } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';

// PRIME_105 Nightmare, warcry: "Set a hero's Health to 15" (either hero)
export default defineCard('PRIME_105', (n) => ({
  target: (c) => c.candidate.kind === 'hero',
  onPlay: [setHeroHealth(chosenTarget(), n.primary)],
}));

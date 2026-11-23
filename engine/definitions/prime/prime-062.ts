import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_062 Crumbling Golem, On Play effect: "Take 4 damage" (the Golem itself takes it: a 5/8 enters as a 5/4. Author, playtest 2026-11-12)
export default defineCard('PRIME_062', (n) => ({
  onPlay: [damage(self(), n.primary)],
}));

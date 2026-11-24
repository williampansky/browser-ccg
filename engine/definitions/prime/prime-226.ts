import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

const SELF_DAMAGE = 5;

// PRIME_226 On Play: "Deal 5 damage to your hero"
export default defineCard('PRIME_226', () => ({
  onPlay: [damage(ownHero(), SELF_DAMAGE)],
}));

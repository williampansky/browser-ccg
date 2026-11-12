import { defineCard } from '../define-card';
import { draw, heal } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// PRIME_156 Surprise, surprise!, Mystery (Damage): "When your hero takes 5 or more damage in one hit, heal 5 and draw a card"
export default defineCard('PRIME_156', () => ({
  mystery: {
    category: 'damage',
    event: 'HeroDamaged',
    when: ({ event, owner }) => event?.type === 'HeroDamaged' && event.player === owner && event.amount >= 5,
    do: [heal(ownHero(), 5), draw(1)],
  },
}));

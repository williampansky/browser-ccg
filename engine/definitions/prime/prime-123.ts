import { defineCard } from '../define-card';
import { damage, draw, grantKeyword, heal } from '../../effects/primitives';
import { chosenTarget, ownHero } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_123 Maven of Renewed Spirit, Select One: "Draw 2, take 2 hero damage;
// or heal your hero 5 and give a friendly minion Bubble" (primary is the
// damage, secondary the heal)
export default defineCard('PRIME_123', (n) => ({
  choices: [
    {
      label: `Draw 2 cards and take ${n.primary} damage`,
      onPlay: [draw(2), damage(ownHero(), n.primary)],
    },
    {
      label: `Heal ${n.secondary} and give a friendly minion Bubble`,
      target: friendlyMinion(),
      onPlay: [
        heal(ownHero(), n.secondary),
        grantKeyword(chosenTarget(), 'bubble'),
      ],
    },
  ],
}));

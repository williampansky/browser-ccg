import { defineCard } from '../define-card';
import { damage, draw, grantKeyword, heal } from '../../effects/primitives';
import { chosenTarget, ownHero } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_123 Maven of Renewed Spirit, Select One: "Draw 2 cards and take 2 damage; or heal your hero 5 and give a friendly minion Bubble"
export default defineCard('PRIME_123', (n) => ({
  choices: [
    { label: 'Draw 2 cards and take 2 damage', onPlay: [draw(2), damage(ownHero(), 2)] },
    {
      label: `Heal ${n.primary} and give a friendly minion Bubble`,
      target: friendlyMinion(),
      onPlay: [heal(ownHero(), n.primary), grantKeyword(chosenTarget(), 'bubble')],
    },
  ],
}));

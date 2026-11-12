import { defineCard } from '../define-card';
import { buff, grantKeyword, heal } from '../../effects/primitives';
import { chosenTarget, ownHero } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_113 Spring Spell, Select One: "+3 Attack and Rush; or +3 Health, Guard and heal your hero 3" (a friendly minion)
export default defineCard('PRIME_113', (n) => ({
  choices: [
    {
      label: `+${n.primary} Attack and Rush`,
      target: friendlyMinion(),
      onPlay: [buff(chosenTarget(), n.primary, 0), grantKeyword(chosenTarget(), 'rush')],
    },
    {
      label: `+${n.primary} Health, Guard and heal your hero ${n.primary}`,
      target: friendlyMinion(),
      onPlay: [buff(chosenTarget(), 0, n.primary), grantKeyword(chosenTarget(), 'guard'), heal(ownHero(), n.primary)],
    },
  ],
}));

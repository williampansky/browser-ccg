import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_113 Spring Spell: "Select One: +4 Attack or +4 Health and Guard" (a friendly minion)
export default defineCard('PRIME_113', (n) => ({
  choices: [
    { label: `+${n.primary} Attack`, target: friendlyMinion(), onPlay: [buff(chosenTarget(), n.primary, 0)] },
    {
      label: `+${n.primary} Health and Guard`,
      target: friendlyMinion(),
      onPlay: [buff(chosenTarget(), 0, n.primary), grantKeyword(chosenTarget(), 'guard')],
    },
  ],
}));

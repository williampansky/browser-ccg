import { defineCard } from '../define-card';
import { buff, grantPoison } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

const NO_HEALTH_BONUS = 0;

// PRIME_267 spell: "Give a friendly minion +2 Attack and Poison"
export default defineCard('PRIME_267', (n) => ({
  target: friendlyMinion(),
  onPlay: [
    buff(chosenTarget(), n.primary, NO_HEALTH_BONUS),
    grantPoison(chosenTarget()),
  ],
}));

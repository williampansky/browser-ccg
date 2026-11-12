import { defineCard } from '../define-card';
import { buffThisTurn, damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_002 Minilock, warcry: "Give a friendly minion +2 Attack this turn; it takes 1 damage"
export default defineCard('PRIME_002', (n) => ({
  target: friendlyMinion(),
  onPlay: [buffThisTurn(chosenTarget(), n.primary), damage(chosenTarget(), 1)],
}));

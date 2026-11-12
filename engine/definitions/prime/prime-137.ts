import { defineCard } from '../define-card';
import { buffThisTurn, grantImmune } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_137 Potion of Wrath (item): "A friendly minion gets +2 Attack and Immune this turn"
export default defineCard('PRIME_137', (n) => ({
  target: friendlyMinion(),
  onPlay: [buffThisTurn(chosenTarget(), n.primary), grantImmune(chosenTarget())],
}));

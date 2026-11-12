import { defineCard } from '../define-card';
import { setAttack } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_161 Enigmatic Courier, warcry: "Debuff a minion's Attack to 1"
export default defineCard('PRIME_161', (n) => ({
  target: anyMinion(),
  onPlay: [setAttack(chosenTarget(), n.primary)],
}));

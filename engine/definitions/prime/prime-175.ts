import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_175 Wayfaring Shaman, warcry: "Buff a friendly minion +3 Health"
export default defineCard('PRIME_175', (n) => ({
  target: friendlyMinion(),
  onPlay: [buff(chosenTarget(), 0, n.primary)],
}));

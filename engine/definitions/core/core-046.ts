import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_046 item: "Buff a minion with Guard and +2/+2"
export default defineCard('CORE_046', (n) => ({
  target: anyMinion(),
  onPlay: [buff(chosenTarget(), n.primary, n.secondary), grantKeyword(chosenTarget(), 'guard')],
}));

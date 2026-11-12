import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { friendlyMinions } from '../../effects/selectors';

// PRIME_116 Book of the Unbroken: "Buff your minions with +2/+2 and Guard"
export default defineCard('PRIME_116', (n) => ({
  onPlay: [buff(friendlyMinions(), n.primary, n.primary), grantKeyword(friendlyMinions(), 'guard')],
}));

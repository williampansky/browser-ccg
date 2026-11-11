import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { otherFriendlyMinions } from '../../effects/selectors';

// CORE_041 warcry: "Buff all friendly minions with a +1/+1" (other minions, as in hsclone)
export default defineCard('CORE_041', (n) => ({
  onPlay: [buff(otherFriendlyMinions(), n.primary, n.secondary)],
}));

import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { otherFriendlyMinions } from '../../effects/selectors';

// CORE_019 warcry: "Give all friendly minions +1 Health" (other minions; hsclone gave attack, text wins)
export default defineCard('CORE_019', (n) => ({
  onPlay: [buff(otherFriendlyMinions(), n.primary, n.secondary)],
}));

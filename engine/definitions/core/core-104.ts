import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { friendlyMinions } from '../../effects/selectors';

// CORE_104 item: "Buff your minions with +2 Health" (printed text wins over hsclone, which hit only Demonic ones)
export default defineCard('CORE_104', (n) => ({
  onPlay: [buff(friendlyMinions(), n.primary, n.secondary)],
}));

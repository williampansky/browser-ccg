import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// CORE_054 warcry: "Buff a friendly minion w/+1 Health" (text wins over hsclone, which gave attack; RULES App. A)
export default defineCard('CORE_054', (n) => ({
  target: friendlyMinion(),
  onPlay: [buff(chosenTarget(), n.primary, n.secondary)],
}));

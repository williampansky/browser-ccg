import { defineCard } from '../define-card';
import { heal } from '../../effects/primitives';
import { allFriendlies } from '../../effects/selectors';

// CORE_032 warcry: "Heal 2 Health to all friendlies" (your hero and minions)
export default defineCard('CORE_032', (n) => ({
  onPlay: [heal(allFriendlies(), n.primary)],
}));

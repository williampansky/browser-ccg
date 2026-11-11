import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

// CORE_124 spell: "Attack ALL minions for 1 damage" (minions only, both sides)
export default defineCard('CORE_124', (n) => ({
  onPlay: [damage(allMinions(), n.primary)],
}));

import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { everyoneElse } from '../../effects/selectors';

// CORE_122 warcry: "Deal 1 damage to everyone else"
export default defineCard('CORE_122', (n) => ({
  onPlay: [damage(everyoneElse(), n.primary)],
}));

import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { everyone } from '../../effects/selectors';

// CORE_121 spell: "Deal 3 damage to EVERYONE"
export default defineCard('CORE_121', (n) => ({
  onPlay: [damage(everyone(), n.primary)],
}));

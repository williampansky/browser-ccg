import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { everyone } from '../../effects/selectors';

// CORE_157 Infernal Hut: "No Attack, Guard, On Death: deal 2 damage to
// everyone" (both heroes and every other minion; it is already gone)
// No Attack and Guard come from the card's mechanics.
export default defineCard('CORE_157', (n) => ({
  onDeath: [damage(everyone(), n.primary)],
}));

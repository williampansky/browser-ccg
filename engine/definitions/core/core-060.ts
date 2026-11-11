import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { randomEnemies } from '../../effects/selectors';

// CORE_060 spell: "Deal 2 damage to two Random enemies" (distinct picks; hsclone hit only one)
export default defineCard('CORE_060', (n) => ({
  onPlay: [damage(randomEnemies(n.random), n.primary)],
}));

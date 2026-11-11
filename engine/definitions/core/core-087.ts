import { defineCard } from '../define-card';
import { heal } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// CORE_087 item: "Heal 5 HP to yourself"
export default defineCard('CORE_087', (n) => ({
  onPlay: [heal(ownHero(), n.primary)],
}));

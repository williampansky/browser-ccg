import { defineCard } from '../define-card';
import { heal } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// CORE_082 warcry: "Heal your Hero for 6 Health"
export default defineCard('CORE_082', (n) => ({
  onPlay: [heal(ownHero(), n.primary)],
}));

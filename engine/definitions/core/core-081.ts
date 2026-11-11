import { defineCard } from '../define-card';
import { heal } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// CORE_081 weapon Reckoning: "Restore 2 HP prior to every attack"
export default defineCard('CORE_081', () => ({
  beforeAttack: [heal(ownHero(), 2)],
}));

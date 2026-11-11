import { defineCard } from '../define-card';
import { destroyEnemyWeapon } from '../../effects/primitives';

// CORE_007 warcry: "Destroy your opponent's weapon" (it also can't attack)
export default defineCard('CORE_007', () => ({
  onPlay: [destroyEnemyWeapon()],
}));

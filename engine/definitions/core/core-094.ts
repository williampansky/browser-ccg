import { defineCard } from '../define-card';
import { buffWeapon } from '../../effects/primitives';

// CORE_094 (item): "Give your weapon +2 attack power"
export default defineCard('CORE_094', (n) => ({ onPlay: [buffWeapon(n.primary)] }));

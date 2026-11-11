import { defineCard } from '../define-card';
import { equipWeapon } from '../../effects/primitives';

// CORE_127 item: "Boon: Gain +4 Attack" - a 4/1 weapon that lasts only this turn (hsclone kept it; the text says this turn only)
export default defineCard('CORE_127', () => ({
  onPlay: [equipWeapon({ temporary: true })],
}));

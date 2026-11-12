import { defineCard } from '../define-card';
import { setHealth } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

// PRIME_162 Ready to Rumble: "Change the Health of ALL minions to 1"
export default defineCard('PRIME_162', (n) => ({ onPlay: [setHealth(allMinions(), n.primary)] }));

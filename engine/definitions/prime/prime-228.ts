import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

// PRIME_228 The Sorcerer's Stone: "Destroy all minions"
export default defineCard('PRIME_228', () => ({ onPlay: [destroy(allMinions())] }));

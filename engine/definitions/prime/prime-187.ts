import { defineCard } from '../define-card';
import { forceFight } from '../../effects/primitives';

// PRIME_187 Showdown: "Force two Random enemy minions to attack each other" (each deals its Attack to the other; nothing with fewer than two)
export default defineCard('PRIME_187', () => ({ onPlay: [forceFight()] }));

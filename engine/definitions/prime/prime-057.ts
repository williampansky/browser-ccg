import { defineCard } from '../define-card';
import { giveOpponentEnergySlot } from '../../effects/primitives';

// PRIME_057 Goblin's Dwelling: "Can't Attack / Guard. Give your opponent an Action Point" (an extra empty energy slot for them, capped at 10)
export default defineCard('PRIME_057', () => ({ onPlay: [giveOpponentEnergySlot(1)] }));

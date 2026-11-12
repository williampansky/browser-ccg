import { defineCard } from '../define-card';
import { grantDeathSummon } from '../../effects/primitives';
import { friendlyMinions } from '../../effects/selectors';

// PRIME_114 Haranna's Curse: "Buff your minions with \"Demise: Summon a Random 2-cost Creature\"" (a playable 2-cost Creature, for its owner)
export default defineCard('PRIME_114', (n) => ({ onPlay: [grantDeathSummon(friendlyMinions(), 'CREATURE', n.primary)] }));

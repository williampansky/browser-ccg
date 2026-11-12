import { defineCard } from '../define-card';
import { redirectCastToCasterMinion } from '../../effects/primitives';

// PRIME_152 Bring the Night, Mystery (Spell): "When an enemy casts a targeted spell, it hits a random minion its caster controls instead"
export default defineCard('PRIME_152', () => ({
  mystery: {
    category: 'spell',
    hook: 'spell',
    when: ({ cast }) => !!cast?.target,
    do: [redirectCastToCasterMinion()],
  },
}));

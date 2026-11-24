import { defineCard } from '../define-card';
import { summonCopyOf } from '../../effects/primitives';
import { eventMinion } from '../../effects/selectors';

// PRIME_144 Mystery (Minion): "After your opponent plays a minion, summon a
// copy of it" (on your side, with its current stats)
export default defineCard('PRIME_144', () => ({
  mystery: {
    category: 'minion',
    event: 'MinionPlayed',
    when: ({ event, owner }) =>
      event?.type === 'MinionPlayed' && event.player !== owner,
    do: [summonCopyOf(eventMinion())],
  },
}));

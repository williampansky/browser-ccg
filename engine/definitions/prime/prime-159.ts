import { defineCard } from '../define-card';
import { disable, halveHealth } from '../../effects/primitives';
import { eventMinion } from '../../effects/selectors';

// PRIME_159 Confrontation, Mystery (Minion): "When your opponent plays a minion, halve its Health (rounded up) and Disable it"
export default defineCard('PRIME_159', () => ({
  mystery: {
    category: 'minion',
    event: 'MinionPlayed',
    when: ({ event, owner }) => event?.type === 'MinionPlayed' && event.player !== owner,
    do: [halveHealth(eventMinion()), disable(eventMinion())],
  },
}));

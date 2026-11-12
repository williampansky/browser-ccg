import { defineCard, on } from '../define-card';
import { swapSelfWithHandMinion } from '../../effects/primitives';

// PRIME_056 Portal: "At the start of your turn, swap this with a Random one in your hand" (a random minion card in your hand takes its place)
export default defineCard('PRIME_056', () => ({
  triggers: [on('TurnStarted', { when: (e, c) => e.player === c.owner, do: [swapSelfWithHandMinion()] })],
}));

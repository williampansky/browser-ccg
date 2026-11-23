import { defineCard, on } from '../define-card';
import { destroy } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

// CORE_134 Abyssal Well: "At the start of your next turn, destroy every single minion" (both boards, itself included).
// It dies with the rest, so the trigger fires once.
export default defineCard('CORE_134', () => ({
  triggers: [on('TurnStarted', { when: (e, c) => e.player === c.owner, do: [destroy(allMinions())] })],
}));

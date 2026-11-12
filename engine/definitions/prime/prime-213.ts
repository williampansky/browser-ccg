import { defineCard, on } from '../define-card';
import { heal } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// PRIME_213 Lava Titan: "Guard. Overcharge (3). When attacked, heal your hero 1"
export default defineCard('PRIME_213', () => ({
  triggers: [
    on('MinionAttacked', { when: (e, c) => e.target.kind === 'minion' && e.target.instanceId === c.selfId, do: [heal(ownHero(), 1)] }),
  ],
}));

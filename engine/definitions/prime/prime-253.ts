import { defineCard } from '../define-card';
import { setHealth, summonEntourage } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

// PRIME_253 Famine and Fear: "Set ALL other minions' Health to 1. Demise: Summon Fear" (not itself: it is a 10/10)
export default defineCard('PRIME_253', (n) => ({
  onPlay: [(ctx) => setHealth((c) => allMinions()(c).filter((t) => t.kind === 'minion' && t.instanceId !== ctx.self), n.primary)(ctx)],
  onDeath: [summonEntourage()],
}));

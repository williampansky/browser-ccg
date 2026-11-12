import { defineCard } from '../define-card';
import { destroy, summonEntourage } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

// PRIME_254 Death and Despair: "Destroy ALL other minions. Demise: Summon Despair" (not itself)
export default defineCard('PRIME_254', () => ({
  onPlay: [(ctx) => destroy((c) => allMinions()(c).filter((t) => t.kind === 'minion' && t.instanceId !== ctx.self))(ctx)],
  onDeath: [summonEntourage()],
}));

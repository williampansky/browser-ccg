import { defineCard } from '../define-card';
import { destroy, summonEntourage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_224 Takeover: "Destroy a minion and summon a 2/2 Husk for you" (the Husk is PRIME_224a)
export default defineCard('PRIME_224', () => ({ target: anyMinion(), onPlay: [destroy(chosenTarget()), summonEntourage()] }));

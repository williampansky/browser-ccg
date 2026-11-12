import { defineCard } from '../define-card';
import { buffThisTurn } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_028 Outlaw Spellsword, warcry: "A minion gets +3 Attack this turn" (any minion, either side)
export default defineCard('PRIME_028', (n) => ({ target: anyMinion(), onPlay: [buffThisTurn(chosenTarget(), n.primary)] }));

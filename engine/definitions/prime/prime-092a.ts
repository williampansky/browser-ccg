import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_092a Sushi (item): "Buff +1/+1" (a friendly minion)
export default defineCard('PRIME_092a', () => ({ target: friendlyMinion(), onPlay: [buff(chosenTarget(), 1, 1)] }));

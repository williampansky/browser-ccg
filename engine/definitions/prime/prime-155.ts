import { defineCard } from '../define-card';
import { grantDrawOnAttack } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_155 Crystal of Virtue (item): "Buff a minion so that you draw a card whenever it attacks"
export default defineCard('PRIME_155', () => ({ target: friendlyMinion(), onPlay: [grantDrawOnAttack(chosenTarget())] }));

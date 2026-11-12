import { defineCard } from '../define-card';
import { draw, healthFloorThisTurn } from '../../effects/primitives';

// PRIME_238 Ring of the Lucii (item): "Your minions can't be reduced below 1 Health this turn; draw a card"
// (a minion at 0 Health is brought back to 1 when the turn settles, so a destroy effect is stopped too)
export default defineCard('PRIME_238', () => ({ onPlay: [healthFloorThisTurn(), draw(1)] }));

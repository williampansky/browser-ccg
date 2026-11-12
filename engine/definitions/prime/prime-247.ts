import { defineCard } from '../define-card';
import { MAX_HEALTH } from '../../state/types';

// PRIME_247 Volcanic Giant: "Costs 1 less to play for each point of damage your hero has taken" (armor does not count)
export default defineCard('PRIME_247', () => ({
  ownCost: ({ state, owner }) => -Math.max(0, MAX_HEALTH - state.players[owner].health),
}));

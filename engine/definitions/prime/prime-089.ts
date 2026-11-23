import { defineCard } from '../define-card';
import { opponentSpellsFreeNextTurn } from '../../effects/primitives';

// PRIME_089 Sir Jorio, On Play effect: "Enemy spells have no cost next turn" (their next turn: all their spells cost 0)
export default defineCard('PRIME_089', () => ({
  onPlay: [opponentSpellsFreeNextTurn()],
}));

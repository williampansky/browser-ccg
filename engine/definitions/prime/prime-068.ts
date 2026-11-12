import { defineCard } from '../define-card';
import { buff, computed } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_068 Ether Wyvern, warcry: "Gain +1 Health for each card in your hand" (the hand after this card has left it)
export default defineCard('PRIME_068', () => ({
  onPlay: [computed((ctx) => buff(self(), 0, ctx.g.players[ctx.caster].hand.length))],
}));

import { defineCard } from '../define-card';
import { enterShadowform } from '../../effects/primitives';

// PRIME_181 Shadowform: "Your Hero Power becomes 'Deal 2 damage'. If already
// in Shadowform: 3 damage." Skill 1 is replaced for the rest of the game (the
// author's call, 2026-11-23); see `skillFor`.
export default defineCard('PRIME_181', () => ({
  onPlay: [enterShadowform],
}));

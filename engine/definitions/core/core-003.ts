import { defineCard } from '../define-card';

// CORE_003 Boon (aura): "Your other Sprites gain +1 Attack power"
export default defineCard('CORE_003', (n) => ({
  auras: [
    {
      affects: ({ sameSide, targetRace }) => sameSide && targetRace === 'SPRITE',
      attack: n.primary,
    },
  ],
}));

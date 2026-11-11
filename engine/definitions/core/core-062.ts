import { defineCard } from '../define-card';

// CORE_062 Boon (aura): "Your Creatures have Stampede (Rush)"
export default defineCard('CORE_062', () => ({
  auras: [{ affects: ({ sameSide, targetRace }) => sameSide && targetRace === 'CREATURE', rush: true }],
}));

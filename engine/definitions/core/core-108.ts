import { defineCard } from '../define-card';

// CORE_108 Boon (aura): "Can't Attack. Adjacent minions have +2 Attack" (hsclone's version never ran)
export default defineCard('CORE_108', (n) => ({
  auras: [{ affects: ({ sameSide, distance }) => sameSide && distance === 1, attack: n.primary }],
}));

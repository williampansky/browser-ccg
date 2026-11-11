import { defineCard } from '../define-card';

// CORE_130 Boon (aura): "Can't Attack. Your minions have +1 AP" (your other minions; no hsclone code existed)
export default defineCard('CORE_130', (n) => ({
  auras: [{ affects: ({ sameSide }) => sameSide, attack: n.primary }],
}));

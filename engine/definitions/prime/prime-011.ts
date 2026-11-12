import { defineCard } from '../define-card';

// PRIME_011 Bannerman: "Buff: Adjacent minions have +1 Attack"
export default defineCard('PRIME_011', (n) => ({
  auras: [{ affects: ({ sameSide, distance }) => sameSide && distance === 1, attack: n.primary }],
}));

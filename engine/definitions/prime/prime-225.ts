import { defineCard } from '../define-card';

// PRIME_225 WarBoss: "Guard. Your other minions have +1 Attack"
export default defineCard('PRIME_225', (n) => ({ auras: [{ affects: ({ sameSide }) => sameSide, attack: n.primary }] }));

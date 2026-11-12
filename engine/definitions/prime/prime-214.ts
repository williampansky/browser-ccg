import { defineCard } from '../define-card';

// PRIME_214 Spirit of the Night (5/5): "Guard, Bubble. Your other minions have Rush"
export default defineCard('PRIME_214', () => ({ auras: [{ affects: ({ sameSide }) => sameSide, rush: true }] }));

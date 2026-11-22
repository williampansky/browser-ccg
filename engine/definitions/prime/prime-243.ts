import { defineCard } from '../define-card';

// PRIME_243 Glacial Crescent (7/1 weapon): "When used, lose 1 attack instead of 1 Durability"
// Every swing, at a minion or a hero, deals its current Attack and then costs 1 Attack; Durability is never spent,
// so it is gone when its Attack reaches 0 (7 swings from new, 7 + 6 + ... + 1 damage in all). RULES Appendix C.
export default defineCard('PRIME_243', () => ({ wearsAttack: true }));

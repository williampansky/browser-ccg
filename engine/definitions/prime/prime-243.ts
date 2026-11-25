import { defineCard } from '../define-card';

// PRIME_243 Glacial Crescent (7/1 weapon): "When used, lose 1 attack instead of
// 1 Durability"
// A swing at a minion deals its current Attack and then costs 1 Attack;
// a swing at a hero uses all of it, so the weapon is destroyed. Durability is
// never spent. RULES Appendix C.
export default defineCard('PRIME_243', () => ({ wearsAttack: true }));

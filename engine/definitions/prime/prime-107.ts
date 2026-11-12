import { defineCard } from '../define-card';

// PRIME_107 Cronus: "Players only have 15s to take their turns" (a turn lasts 15 seconds, not 60, while it is on a board; see `turnSeconds`)
export default defineCard('PRIME_107', () => ({ turnSeconds: 15 }));

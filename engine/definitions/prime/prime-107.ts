import { defineCard } from '../define-card';

// PRIME_107 Cronus: "While this is on a board, your opponent's turns last only 30 seconds" (see `turnSeconds`; the owner's own turns stay 60)
export default defineCard('PRIME_107', () => ({ opponentTurnSeconds: 30 }));

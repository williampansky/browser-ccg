import type { Card } from '../cards/types';
import type { MinionInstance } from '../state/types';

/** Builds a fresh minion from its card. Keyword flags come from the card's mechanics. */
export const createMinion = (card: Card, instanceId: number, turn: number, playSeq: number): MinionInstance => {
  const has = (symbol: string): boolean => card.mechanics.includes(symbol);
  const health = card.health ?? 0;
  return {
    instanceId,
    cardId: card.id,
    attack: card.attack ?? 0,
    health,
    maxHealth: health,
    playedOnTurn: turn,
    attacksThisTurn: 0,
    playSeq,
    auraAttack: 0,
    auraRush: false,
    tempAttack: 0,
    keywords: {
      guard: has('BULWARK'),
      rush: has('RUSH'),
      bubble: has('BUBBLE'),
      doubleAttack: has('DOUBLE_ATTACK'),
      hidden: has('HIDDEN'),
      noAttack: has('NO_ATTACK'),
    },
  };
};
